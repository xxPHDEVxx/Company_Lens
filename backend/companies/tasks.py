"""
Celery tasks for company data fetching and processing.
Integrates with the AI scraping system to fetch Belgian company data.
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import timedelta, datetime

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
                'province': address_data.get('province') or '',  # Handle None
                'region': address_data.get('region') or '',  # Handle None
                'country': address_data.get('country') or 'BE',  # Handle None
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
                    'province': est_address_data.get('province') or '',  # Handle None
                    'region': est_address_data.get('region') or '',  # Handle None
                    'country': est_address_data.get('country') or 'BE',  # Handle None
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


@shared_task(name='companies.tasks.process_scraped_data')
def process_scraped_data(scraper_result: Dict[str, Any], vat_number: str) -> Dict[str, Any]:
    """
    Process and save scraped company data.
    This task is called as a callback after AI scraping completes.

    Args:
        scraper_result: Result from AI scraper
        vat_number: Belgian VAT number (will be normalized to BE format)

    Returns:
        Dict with status and saved company data
    """
    # Normalize VAT to BE format for consistency
    clean_vat = vat_number.upper().replace(' ', '').replace('.', '')
    if not clean_vat.startswith('BE'):
        clean_vat = 'BE' + clean_vat.lstrip('0')
    if clean_vat.startswith('BE') and len(clean_vat) < 12:
        clean_vat = 'BE' + clean_vat[2:].zfill(10)

    logger.info(f"Processing scraped data for VAT: {vat_number} (normalized: {clean_vat})")

    try:
        # Check if scraper returned an error
        if isinstance(scraper_result, dict) and scraper_result.get('status') == 'failed':
            error_msg = scraper_result.get('error', 'Unknown error')
            logger.error(f"AI scraper failed for VAT {clean_vat}: {error_msg}")

            # Store failure in cache
            cache.set(f"company_fetch_failed:{clean_vat}", {
                'error': error_msg,
                'timestamp': timezone.now().isoformat()
            }, timeout=3600)

            return {
                'status': 'error',
                'error': error_msg,
                'vat_number': clean_vat
            }

        # Process and save the company data with normalized VAT
        company = save_company_from_scraper_data(scraper_result, clean_vat)

        # Cache the result
        serializer = CompanyDetailSerializer(company)
        result_data = {
            'status': 'success',
            'data': serializer.data,
            'source': 'ai_scraper'
        }

        cache_key = f"company_data:{clean_vat}"
        cache.set(cache_key, result_data, timeout=settings.COMPANY_DATA_CACHE_TTL)

        # Update fetch status in cache to "completed"
        fetch_status_key = f"fetch_status:{clean_vat}"
        cache.set(fetch_status_key, {
            'status': 'completed',
            'data': serializer.data,
            'timestamp': timezone.now().isoformat()
        }, timeout=300)

        # Update the user who requested this scraping (if any)
        # Check cache for user_id stored during the initial request
        user_cache_key = f"scraping_user:{clean_vat}"
        user_id = cache.get(user_cache_key)

        if user_id:
            try:
                user = User.objects.get(id=user_id)
                user.company_id = company.id
                user.save()
                logger.info(
                    f"Updated user {user.email} (ID: {user_id}) with company_id {company.id} "
                    f"after successful scraping of VAT {clean_vat}"
                )
                # Clean up cache
                cache.delete(user_cache_key)
            except User.DoesNotExist:
                logger.warning(f"User {user_id} not found when trying to update company_id")

        logger.info(f"Successfully processed and saved company data for VAT: {clean_vat}")
        return result_data

    except Exception as e:
        logger.exception(f"Error processing scraped data for VAT {clean_vat}: {e}")

        # Store failure in cache
        cache.set(f"company_fetch_failed:{clean_vat}", {
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, timeout=3600)

        return {
            'status': 'error',
            'error': str(e),
            'vat_number': clean_vat
        }


@shared_task(
    base=CompanyFetchTask,
    name='companies.tasks.fetch_company_data_async',
    time_limit=300,
    soft_time_limit=240
)
def fetch_company_data_async(vat_number: str, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Async Celery task that orchestrates company data fetching using task callbacks.
    This task launches the AI scraper with a callback to process the results.

    Args:
        vat_number: Belgian VAT number (format: BE0123456789)
        user_id: Optional user ID who requested the fetch

    Returns:
        Dict with task information
    """
    logger.info(f"Starting async company data fetch for VAT: {vat_number}")

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

    # VAT Format Flow:
    # 1. Frontend sends: BE0684773280
    # 2. We remove BE prefix here: 0684773280 (for AI scraper compatibility)
    # 3. AI scraper processes: 0684773280
    # 4. Backend callback normalizes back to: BE0684773280 (in process_scraped_data)
    # 5. Database stores: BE0684773280
    clean_vat = vat_number.replace('BE', '').replace(' ', '')

    try:
        logger.info(f"Launching AI scraper task for VAT: {clean_vat}")

        from celery import current_app

        # Store user_id in cache if provided, so we can update the user after scraping
        if user_id:
            cache_key = f"scraping_user:{vat_number}"
            cache.set(cache_key, user_id, timeout=3600)  # 1 hour timeout
            logger.info(f"Stored user_id {user_id} in cache for VAT: {vat_number}")

        # Send AI scraper task (it will manually trigger the callback when done)
        result = current_app.send_task(
            'ai_scraper.tasks.scrape_company',
            args=[clean_vat],
            queue='scraper'
        )

        logger.info(f"AI scraper task launched for VAT {vat_number}, task_id: {result.id}")

        return {
            'status': 'pending',
            'task_id': result.id,
            'vat_number': vat_number,
            'message': 'Scraping initiated'
        }

    except Exception as e:
        logger.exception(f"Error launching async fetch for VAT {vat_number}: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'vat_number': vat_number
        }


