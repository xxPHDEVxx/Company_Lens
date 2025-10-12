"""
Django management command to refresh company data by re-scraping.
Usage: python manage.py refresh_companies [--limit N]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from companies.models import Company
from companies.tasks import fetch_company_data_async
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Refresh company data by re-scraping from external sources'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Maximum number of companies to refresh (default: all)'
        )
        parser.add_argument(
            '--older-than-days',
            type=int,
            default=7,
            help='Only refresh companies older than N days (default: 7)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show which companies would be refreshed without actually doing it'
        )

    def handle(self, *args, **options):
        limit = options['limit']
        older_than_days = options['older_than_days']
        dry_run = options['dry_run']

        # Calculate cutoff date
        cutoff_date = timezone.now() - timezone.timedelta(days=older_than_days)

        # Query companies that need refreshing
        companies = Company.objects.filter(
            updated_at__lt=cutoff_date
        ).order_by('updated_at')

        if limit:
            companies = companies[:limit]

        count = companies.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would refresh {count} companies older than {older_than_days} days'
                )
            )
            for company in companies[:10]:  # Show first 10
                self.stdout.write(f'  - {company.name} ({company.vat}) - Last updated: {company.updated_at}')
            if count > 10:
                self.stdout.write(f'  ... and {count - 10} more')
            return

        self.stdout.write(f'Starting refresh for {count} companies...')

        success_count = 0
        error_count = 0

        for company in companies:
            try:
                # Trigger async scraping task
                result = fetch_company_data_async.delay(company.vat)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Queued {company.name} ({company.vat}) - Task ID: {result.id}'
                    )
                )
                success_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Failed to queue {company.name} ({company.vat}): {str(e)}'
                    )
                )
                error_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nRefresh complete: {success_count} queued, {error_count} errors'
            )
        )
