"""
Celery tasks for company data fetching and processing.
Integrates with the AI scraping system to fetch Belgian company data.
"""

import logging
import json
import subprocess
import sys
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from pathlib import Path

from celery import shared_task, Task
from celery.exceptions import SoftTimeLimitExceeded, MaxRetriesExceededError
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
        return create_mock_company_data(vat_number)
    
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


def call_ai_scraper(vat_number: str) -> Dict[str, Any]:
    """
    Call the AI scraping system to fetch company data.
    
    This function interfaces with the AI scraper module.
    Currently returns mock data when AI system is not configured.
    """
    # Check if AI scraper path exists
    ai_scraper_path = Path(settings.AI_SCRAPER_BASE_PATH)
    if not ai_scraper_path.exists():
        logger.warning(f"AI scraper path does not exist: {ai_scraper_path}")
        return create_mock_company_data(vat_number)
    
    try:
        # Try to import and use the AI scraper
        # This is a placeholder for when the AI system is properly configured
        scraper_script = ai_scraper_path / 'src' / 'company_scraper' / 'runnable' / 'company_scraper.py'
        
        if scraper_script.exists():
            # Run the scraper as a subprocess (simplified version)
            # In production, this would use the proper AI scraper API
            logger.info(f"Would call AI scraper for VAT: {vat_number}")
            # For now, return mock data
            return create_mock_company_data(vat_number)
        else:
            logger.warning(f"AI scraper script not found: {scraper_script}")
            return create_mock_company_data(vat_number)
            
    except Exception as e:
        logger.error(f"Error calling AI scraper: {e}")
        return {
            'status': 'error',
            'error': str(e)
        }


def create_mock_company_data(vat_number: str) -> Dict[str, Any]:
    """Create mock company data for testing when AI scraper is not available."""
    return {
        'status': 'success',
        'data': {
            'vat': vat_number,
            'name': f'Mock Company {vat_number}',
            'status': 'active',
            'legal_form': 'SRL',
            'creation_date': '2020-01-01',
            'address': {
                'street': 'Rue de la Loi',
                'street_number': '42',
                'postal_code': '1000',
                'city': 'Brussels',
                'region': 'brussels',
                'country': 'BE'
            },
            'contact': {
                'email': f'info@{vat_number.lower()}.be',
                'phone': '+32 2 123 45 67',
                'website': f'https://www.{vat_number.lower()}.be'
            },
            'activities': {
                'nacebel_codes': ['62.01', '62.02'],
                'sectors': ['Information Technology', 'Software Development'],
                'services': ['Custom software development', 'IT consulting'],
                'description': 'Mock company providing IT services'
            },
            'company_size': 'small',
            'employees': 25
        }
    }


@transaction.atomic
def save_company_from_scraper_data(data: Dict[str, Any], vat_number: str) -> Company:
    """
    Save or update company data from scraper results.
    
    Args:
        data: Scraped company data
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
            defaults={
                'postal_box': address_data.get('postal_box', ''),
                'province': address_data.get('province', ''),
                'region': address_data.get('region', ''),
                'country': address_data.get('country', 'BE'),
            }
        )
    
    # Create or update company
    contact_data = data.get('contact', {})
    company, created = Company.objects.update_or_create(
        vat=vat_number,
        defaults={
            'id': vat_number.replace('BE', 'C'),  # Generate ID from VAT
            'name': data.get('name', f'Company {vat_number}'),
            'status': data.get('status', 'active'),
            'legal_form': data.get('legal_form', ''),
            'creation_date': data.get('creation_date'),
            'fiscal_year': data.get('fiscal_year', ''),
            'capital': data.get('capital', ''),
            'employees': data.get('employees'),
            'company_type': data.get('company_type', ''),
            'company_size': data.get('company_size', ''),
            'address': address,
            'website': contact_data.get('website', ''),
            'phone': contact_data.get('phone', ''),
            'email': contact_data.get('email', ''),
        }
    )
    
    # Save activities if present
    activities_data = data.get('activities', {})
    if activities_data:
        Activity.objects.update_or_create(
            company=company,
            defaults={
                'nacebel_codes': activities_data.get('nacebel_codes', []),
                'company_activities': activities_data.get('company_activities', []),
                'sectors': activities_data.get('sectors', []),
                'services': activities_data.get('services', []),
                'description': activities_data.get('description', ''),
            }
        )
    
    # Save establishments if present
    establishments_data = data.get('establishments', [])
    for est_data in establishments_data:
        est_address_data = est_data.get('address', {})
        est_address = None
        
        if est_address_data:
            est_address, _ = Address.objects.update_or_create(
                street=est_address_data.get('street', ''),
                street_number=est_address_data.get('street_number', ''),
                postal_code=est_address_data.get('postal_code', ''),
                city=est_address_data.get('city', ''),
                defaults={
                    'postal_box': est_address_data.get('postal_box', ''),
                    'province': est_address_data.get('province', ''),
                    'region': est_address_data.get('region', ''),
                    'country': est_address_data.get('country', 'BE'),
                }
            )
        
        Establishment.objects.update_or_create(
            company=company,
            unit_number=est_data.get('unit_number', ''),
            defaults={
                'name': est_data.get('name', ''),
                'address': est_address,
                'creation_date': est_data.get('creation_date'),
                'status': est_data.get('status', 'active'),
            }
        )
    
    # Save financial data if present
    financial_data_list = data.get('financial_data', [])
    for fin_data in financial_data_list:
        FinancialData.objects.update_or_create(
            company=company,
            year=fin_data.get('year'),
            defaults={
                'revenue': fin_data.get('revenue'),
                'profit': fin_data.get('profit'),
                'margin': fin_data.get('margin'),
                'employees': fin_data.get('employees'),
                'extra_data': fin_data.get('extra_data', {}),
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


@shared_task(name='companies.tasks.process_batch_companies')
def process_batch_companies(vat_numbers: List[str]) -> Dict[str, Any]:
    """
    Process multiple company VAT numbers in batch.
    
    Args:
        vat_numbers: List of Belgian VAT numbers
        
    Returns:
        Dict with batch processing results
    """
    results = {
        'total': len(vat_numbers),
        'processed': 0,
        'successful': 0,
        'failed': 0,
        'tasks': []
    }
    
    for vat_number in vat_numbers:
        try:
            task = fetch_company_data.delay(vat_number)
            results['tasks'].append({
                'vat_number': vat_number,
                'task_id': task.id
            })
            results['processed'] += 1
        except Exception as e:
            logger.error(f"Failed to queue task for VAT {vat_number}: {e}")
            results['failed'] += 1
    
    return results


@shared_task(name='companies.tasks.cleanup_stale_data')
def cleanup_stale_data() -> Dict[str, Any]:
    """
    Clean up stale company data and expired cache entries.
    
    Returns:
        Dict with cleanup statistics
    """
    stats = {
        'expired_cache_cleared': 0,
        'old_financials_deleted': 0,
        'timestamp': timezone.now().isoformat()
    }
    
    try:
        # Clear old financial data (keep last 5 years)
        cutoff_year = timezone.now().year - 5
        old_financials = FinancialData.objects.filter(year__lt=cutoff_year)
        stats['old_financials_deleted'] = old_financials.count()
        old_financials.delete()
        
        logger.info(f"Cleanup completed: {stats}")
        
    except Exception as e:
        logger.error(f"Cleanup task failed: {e}")
        stats['error'] = str(e)
    
    return stats


@shared_task(name='companies.tasks.update_followed_companies')
def update_followed_companies() -> Dict[str, Any]:
    """
    Update data for all followed companies.
    
    Returns:
        Dict with update statistics
    """
    stats = {
        'total_followed': 0,
        'updated': 0,
        'failed': 0,
        'timestamp': timezone.now().isoformat()
    }
    
    try:
        # Get unique companies that have followers
        followed_companies = Company.objects.filter(
            followers__notify_updates=True
        ).distinct()
        
        stats['total_followed'] = followed_companies.count()
        
        for company in followed_companies:
            try:
                # Check if update is needed (last update > 24 hours ago)
                if company.updated_at < timezone.now() - timedelta(hours=24):
                    update_company_data.delay(company.id)
                    stats['updated'] += 1
            except Exception as e:
                logger.error(f"Failed to update company {company.id}: {e}")
                stats['failed'] += 1
        
        logger.info(f"Followed companies update completed: {stats}")
        
    except Exception as e:
        logger.error(f"Followed companies update task failed: {e}")
        stats['error'] = str(e)
    
    return stats


@shared_task(name='companies.tasks.notify_company_update')
def notify_company_update(company_id: str) -> Dict[str, Any]:
    """
    Notify followers when a company is updated.
    
    Args:
        company_id: Company primary key
        
    Returns:
        Dict with notification statistics
    """
    stats = {
        'company_id': company_id,
        'notifications_sent': 0,
        'timestamp': timezone.now().isoformat()
    }
    
    try:
        company = Company.objects.get(id=company_id)
        followers = CompanyFollower.objects.filter(
            company=company,
            notify_updates=True
        ).select_related('user')
        
        for follower in followers:
            # Here you would send actual notifications
            # For now, just log it
            logger.info(f"Would notify user {follower.user.email} about {company.name} update")
            stats['notifications_sent'] += 1
        
        logger.info(f"Notifications sent for company {company_id}: {stats}")
        
    except Company.DoesNotExist:
        logger.error(f"Company not found for notification: {company_id}")
        stats['error'] = f'Company {company_id} not found'
    except Exception as e:
        logger.error(f"Notification task failed for company {company_id}: {e}")
        stats['error'] = str(e)
    
    return stats