"""
Celery tasks for company data fetching and processing.
Integrates with the AI scraping system to fetch Belgian company data.
"""

import logging
import json
import subprocess
from typing import Dict, Any, Optional, List
from datetime import timedelta, datetime
from pathlib import Path

from celery import shared_task, Task
from celery.exceptions import SoftTimeLimitExceeded
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import (
    Company, Address, Activity, Establishment, 
    FinancialData, CompanyFollower
)
from .serializers import CompanyDetailSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


class CompanyFetchTask(Task):
    """Base task class for company fetching with proper error handling."""
    
    autoretry_for = (ConnectionError, TimeoutError)
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True
    retry_jitter = True
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure by logging and notifying."""
        vat_number = kwargs.get('vat_number', 'Unknown')
        logger.error(
            f"Company fetch task failed for VAT {vat_number}: {exc}",
            extra={
                'task_id': task_id,
                'vat_number': vat_number,
                'error': str(exc),
                'traceback': str(einfo)
            }
        )
        
        # Store failure in cache for quick lookup
        cache_key = f"company_fetch_failed:{vat_number}"
        cache.set(cache_key, {
            'error': str(exc),
            'timestamp': timezone.now().isoformat(),
            'task_id': task_id
        }, timeout=3600)  # Keep for 1 hour


@shared_task(base=CompanyFetchTask, name='companies.tasks.fetch_company_data')
def fetch_company_data(vat_number: str, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Fetch company data from the AI scraping system.
    
    Args:
        vat_number: Belgian VAT number (format: BE0123456789)
        user_id: Optional user ID who requested the fetch
    
    Returns:
        Dict containing the fetched company data or error information
    """
    logger.info(f"Starting company data fetch for VAT: {vat_number}")
    
    # Check if we have recent data in cache
    cache_key = f"company_data:{vat_number}"
    cached_data = cache.get(cache_key)
    if cached_data:
        logger.info(f"Returning cached data for VAT: {vat_number}")
        return cached_data
    
    # Check if company already exists in database
    try:
        company = Company.objects.get(vat=vat_number)
        # Check if data is recent (less than 24 hours old)
        if company.updated_at > timezone.now() - timedelta(hours=24):
            logger.info(f"Company {vat_number} data is recent, skipping fetch")
            serializer = CompanyDetailSerializer(company)
            return {
                'status': 'existing',
                'data': serializer.data,
                'source': 'database'
            }
    except Company.DoesNotExist:
        pass
    
    # Check if AI scraper is enabled
    if not settings.AI_SCRAPER_ENABLED:
        logger.warning("AI scraper is not enabled, using mock data")
    
    try:
        # Call the AI scraping system
        result = call_ai_scraper(vat_number)
        
        if result and result.get('status') == 'success':
            # Process and save the company data
            company = save_company_from_scraper_data(result.get('data', {}), vat_number)
            
            # Cache the result
            serializer = CompanyDetailSerializer(company)
            cache.set(cache_key, {
                'status': 'success',
                'data': serializer.data,
                'source': 'ai_scraper'
            }, timeout=settings.COMPANY_DATA_CACHE_TTL)
            
            logger.info(f"Successfully fetched and saved company data for VAT: {vat_number}")
            
            return {
                'status': 'success',
                'data': serializer.data,
                'source': 'ai_scraper'
            }
        else:
            error_msg = result.get('error', 'Unknown error from AI scraper')
            logger.error(f"AI scraper failed for VAT {vat_number}: {error_msg}")
            return {
                'status': 'error',
                'error': error_msg,
                'vat_number': vat_number
            }
            
    except SoftTimeLimitExceeded:
        logger.error(f"Task timeout while fetching VAT {vat_number}")
        return {
            'status': 'error',
            'error': 'Request timeout - company data fetch took too long',
            'vat_number': vat_number
        }
    except Exception as e:
        logger.exception(f"Unexpected error fetching VAT {vat_number}: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'vat_number': vat_number
        }


def call_ai_scraper(vat_number: str, website: Optional[str] = None) -> Dict[str, Any]:
    """
    Call the AI scraping system to fetch company data.

    Uses the CLI entry point for secure execution without dynamic code generation.

    Args:
        vat_number: Belgian VAT number (format: BE0123456789 or 0123456789)
        website: Optional company website URL

    Returns:
        Dict containing status and company data or error information
    """
    # Check if AI scraper path exists
    ai_scraper_path = Path(settings.AI_SCRAPER_BASE_PATH)
    if not ai_scraper_path.exists():
        logger.warning(f"AI scraper path does not exist: {ai_scraper_path}")

    # Clean VAT number (remove BE prefix if present)
    clean_vat = vat_number.replace('BE', '').replace(' ', '')

    try:
        logger.info(f"Calling AI scraper for VAT: {clean_vat}")

        # Build command with CLI entry point
        cmd = ['poetry', 'run', 'scrape-company', '--vat', clean_vat]
        if website:
            cmd.extend(['--website', website])

        # Run the scraper using Poetry CLI entry point
        result = subprocess.run(
            cmd,
            cwd=str(ai_scraper_path),
            capture_output=True,
            text=True,
            timeout=settings.AI_SCRAPER_TIMEOUT,
            env={**subprocess.os.environ, 'PYTHONPATH': '.'}
        )

        # Parse JSON output (first line - logs go to stderr)
        try:
            output_lines = result.stdout.strip().split('\n')
            json_output = output_lines[0]  # JSON is on first line
            scraper_data = json.loads(json_output)

            # Check if scraper returned an error
            if scraper_data.get('status') == 'failed':
                error_msg = scraper_data.get('error', 'Unknown error')
                logger.error(f"AI scraper failed for VAT {clean_vat}: {error_msg}")
                return {
                    'status': 'error',
                    'error': error_msg
                }

            logger.info(f"Successfully scraped data for VAT: {clean_vat}")
            return {
                'status': 'success',
                'data': scraper_data
            }

        except (json.JSONDecodeError, IndexError) as e:
            logger.error(f"Failed to parse scraper output: {e}")
            logger.debug(f"Output: {result.stdout}")
            logger.debug(f"Stderr: {result.stderr}")
            return {
                'status': 'error',
                'error': f'Invalid output from scraper: {str(e)}'
            }

    except subprocess.TimeoutExpired:
        logger.error(f"AI scraper timeout for VAT {clean_vat}")
        return {
            'status': 'error',
            'error': f'Scraper timeout after {settings.AI_SCRAPER_TIMEOUT} seconds'
        }
    except Exception as e:
        logger.error(f"Error calling AI scraper: {e}")
        return {
            'status': 'error',
            'error': str(e)
        }


def parse_french_date(date_str: Optional[str]) -> Optional[str]:
    """
    Parse French date format (e.g., "18 janvier 2024") to Django format (YYYY-MM-DD).
    Returns None if parsing fails.
    """
    if not date_str:
        return None

    # French month names mapping
    french_months = {
        'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
        'juillet': 7, 'août': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
    }

    try:
        # Try parsing as YYYY-MM-DD first
        datetime.strptime(date_str, '%Y-%m-%d')
        return date_str
    except ValueError:
        pass

    try:
        # Parse French format: "18 janvier 2024"
        parts = date_str.split()
        if len(parts) == 3:
            day = int(parts[0])
            month = french_months.get(parts[1].lower())
            year = int(parts[2])

            if month:
                return f"{year:04d}-{month:02d}-{day:02d}"
    except (ValueError, IndexError):
        pass

    return None


# Until better integration this function will ensure the data are correctly adapted to the backend model
@transaction.atomic
def save_company_from_scraper_data(data: Dict[str, Any], vat_number: str) -> Company:
    """
    Save or update company data from AI scraper results.

    Maps the AI CompanySchema structure to Django models.

    Args:
        data: Scraped company data (CompanySchema.model_dump() output)
        vat_number: Belgian VAT number

    Returns:
        Company instance
    """
    # Extract address data
    address_data = data.get('address', {})
    address = None

    if address_data:
        address, _ = Address.objects.update_or_create(
            street=address_data.get('street', ''),
            street_number=address_data.get('street_number', ''),
            postal_code=address_data.get('postal_code', ''),
            city=address_data.get('city', ''),
            postal_box=address_data.get('postal_box') or '',  # Ensure not None
            defaults={
                'province': address_data.get('province', ''),
                'region': address_data.get('region', ''),
                'country': address_data.get('country', 'BE'),
            }
        )

    # Extract finance data
    finance_data = data.get('finance', {})
    employees = finance_data.get('number_of_employees') if finance_data else None

    # Create or update company
    contact_data = data.get('contact', {}) or {}
    activity_data = data.get('activity', {}) or {}

    # Map company_type list to string (take first type)
    company_types = data.get('company_type', [])
    company_type_str = company_types[0] if isinstance(company_types, list) and company_types else ''

    # Use VAT as ID (it's already unique)
    # Prepare company data
    company_data = {
        'name': data.get('name', f'Company {vat_number}'),
        'status': 'active',  # AI schema doesn't have status field
        'legal_form': data.get('legal_form', ''),
        'creation_date': parse_french_date(data.get('established')),
        'employees': employees,
        'company_type': company_type_str,
        'company_size': data.get('company_size', ''),
        'address': address,
        'website': contact_data.get('website', ''),
        'phone': contact_data.get('phone', ''),
        'email': contact_data.get('email', ''),
    }

    # Try to get existing company first
    try:
        company = Company.objects.get(vat=vat_number)
        # Update existing company
        for key, value in company_data.items():
            setattr(company, key, value)
        company.save()
        created = False
    except Company.DoesNotExist:
        # Create new company with VAT as ID
        company = Company(id=vat_number, vat=vat_number)
        for key, value in company_data.items():
            setattr(company, key, value)
        company.save()
        created = True

    # Save activities if present
    if activity_data:
        Activity.objects.update_or_create(
            company=company,
            defaults={
                'nacebel_codes': activity_data.get('nacebel_codes', []),
                'company_activities': activity_data.get('company_activities', []),
                'sectors': activity_data.get('sectors', []),
                'services': activity_data.get('services', []),
                'description': data.get('company_description', ''),
            }
        )

    # Save establishment units if present
    establishments_data = data.get('establishment_units', []) or []
    for est_data in establishments_data:
        est_address_data = est_data.get('establishment_address', {})
        est_address = None

        if est_address_data:
            est_address, _ = Address.objects.update_or_create(
                street=est_address_data.get('street', ''),
                street_number=est_address_data.get('street_number', ''),
                postal_code=est_address_data.get('postal_code', ''),
                city=est_address_data.get('city', ''),
                postal_box=est_address_data.get('postal_box') or '',  # Ensure not None
                defaults={
                    'province': est_address_data.get('province', ''),
                    'region': est_address_data.get('region', ''),
                    'country': est_address_data.get('country', 'BE'),
                }
            )

        Establishment.objects.update_or_create(
            company=company,
            unit_number=est_data.get('establishment_number', ''),
            defaults={
                'name': est_data.get('denomination', ''),
                'address': est_address,
                'creation_date': parse_french_date(est_data.get('date')),
                'status': 'active' if est_data.get('statut', '').lower() == 'actif' else 'inactive',
            }
        )

    # Save financial data if present
    if finance_data:
        gross_margin = finance_data.get('gross_margin')
        if gross_margin:
            # Store financial data (AI scraper provides summary data, not yearly)
            FinancialData.objects.update_or_create(
                company=company,
                year=timezone.now().year,  # Use current year as default
                defaults={
                    'revenue': gross_margin,
                    'employees': employees,
                }
            )

    logger.info(f"{'Created' if created else 'Updated'} company: {company.name} ({company.vat})")
    return company


@shared_task(name='companies.tasks.update_company_data')
def update_company_data(company_id: str) -> Dict[str, Any]:
    """
    Update existing company data from the AI scraper.
    
    Args:
        company_id: Company primary key
        
    Returns:
        Dict with update status
    """
    try:
        company = Company.objects.get(id=company_id)
        result = fetch_company_data.delay(company.vat)
        return {
            'status': 'scheduled',
            'task_id': result.id,
            'company_id': company_id
        }
    except Company.DoesNotExist:
        logger.error(f"Company not found: {company_id}")
        return {
            'status': 'error',
            'error': f'Company {company_id} not found'
        }