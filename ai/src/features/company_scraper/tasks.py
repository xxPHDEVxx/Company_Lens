"""
Celery tasks for company scraping.
"""
import logging
from typing import Dict, Any, Optional
from celery import shared_task

from .runnable.company_scraper import run as scrape_company
from src.core.models.scrape.scrape_company_dto import ScrapeCompanyDto

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name='ai_scraper.tasks.scrape_company',
    queue='scraper',
    max_retries=3,
    default_retry_delay=60,
    time_limit=300,
    soft_time_limit=240
)
def scrape_company_task(self, vat_number: str, website: Optional[str] = None) -> Dict[str, Any]:
    """
    Celery task to scrape company data using AI.

    Args:
        vat_number: Belgian VAT number (with or without BE prefix)
        website: Optional company website URL

    Returns:
        dict: Scraped company data or error information
    """
    from celery import current_app

    try:
        logger.info(f"Starting AI scrape task for VAT: {vat_number}")

        # Create DTO object for the scraper
        fields = ScrapeCompanyDto(vat_number=vat_number, website=website)

        # Call the scraper
        result = scrape_company(fields)

        # Check if scraping failed (returned None)
        if result is None:
            logger.error(f"Scraping returned None for VAT: {vat_number}")
            error_result = {
                'status': 'failed',
                'error': 'Unable to scrape company data - address resolution failed',
                'vat_number': vat_number
            }

            # Trigger callback manually to backend
            try:
                current_app.send_task(
                    'companies.tasks.process_scraped_data',
                    args=[error_result, vat_number],
                    queue='default'
                )
                logger.info(f"Sent error result to backend for VAT: {vat_number}")
            except Exception as callback_err:
                logger.error(f"Failed to send error callback: {callback_err}")

            return error_result

        logger.info(f"Successfully scraped data for VAT: {vat_number}")

        # Trigger callback manually to backend
        try:
            current_app.send_task(
                'companies.tasks.process_scraped_data',
                args=[result, vat_number],
                queue='default'
            )
            logger.info(f"Sent scraped data to backend for VAT: {vat_number}")
        except Exception as callback_err:
            logger.error(f"Failed to send success callback: {callback_err}")

        return result

    except Exception as exc:
        logger.error(f"Error scraping VAT {vat_number}: {exc}")
        error_result = {
            'status': 'failed',
            'error': str(exc),
            'vat_number': vat_number
        }

        # Trigger callback manually to backend
        try:
            current_app.send_task(
                'companies.tasks.process_scraped_data',
                args=[error_result, vat_number],
                queue='default'
            )
            logger.info(f"Sent error result to backend for VAT: {vat_number}")
        except Exception as callback_err:
            logger.error(f"Failed to send error callback: {callback_err}")

        return error_result
