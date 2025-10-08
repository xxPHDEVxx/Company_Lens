"""
CLI entry points for the AI scraper module.
Provides command-line interface for scraping company data.
"""

import click
import json
import sys
from typing import Optional

from src.features.company_scraper.runnable.company_scraper import run
from src.core.models.scrape.scrape_company_dto import ScrapeCompanyDto


@click.command()
@click.option('--vat', required=True, help='Belgian VAT number (without BE prefix)')
@click.option('--website', default=None, help='Optional company website URL')
def scrape(vat: str, website: Optional[str]):
    """
    Scrape company data for a given Belgian VAT number.

    Args:
        vat: Belgian VAT number (format: 0123456789, without BE prefix)
        website: Optional company website URL for additional data

    Returns:
        JSON output with company data to stdout
    """
    try:
        # Create DTO with VAT and optional website
        dto = ScrapeCompanyDto(vat_number=vat, website=website)

        # Run scraper and get results
        result = run(dto)

        # Output as JSON to stdout
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)

    except Exception as e:
        # Output error as JSON
        error_output = {
            'error': str(e),
            'vat_number': vat,
            'status': 'failed'
        }
        print(json.dumps(error_output, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    scrape()
