"""
Management command to create demo data for development and testing.
Creates sample companies, users, and groups with Belgian-specific data.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
import random
from companies.models import Company, Establishment, FinancialData
from groups.models import CompanyGroup, GroupMembership

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates demo data for Company Lens'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=3,
            help='Number of demo users to create'
        )
        parser.add_argument(
            '--companies',
            type=int,
            default=20,
            help='Number of demo companies to create'
        )

    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')
        
        # Create demo users
        users = self.create_users(options['users'])
        
        # Create demo companies
        companies = self.create_companies(options['companies'])
        
        # Create establishments for some companies
        self.create_establishments(companies[:10])
        
        # Create financial data
        self.create_financial_data(companies[:15])
        
        # Create groups and add companies
        self.create_groups(users[0], companies)
        
        self.stdout.write(self.style.SUCCESS('Demo data created successfully!'))
        self.stdout.write(f'Created {len(users)} users')
        self.stdout.write(f'Created {len(companies)} companies')
        self.stdout.write('Demo credentials:')
        self.stdout.write('  Email: demo@example.com')
        self.stdout.write('  Password: password123')

    def create_users(self, count):
        """Create demo users."""
        users = []
        
        # Create main demo user
        demo_user, created = User.objects.get_or_create(
            email='demo@example.com',
            defaults={
                'name': 'Demo User',
                'is_active': True,
                'language': 'fr',
            }
        )
        if created:
            demo_user.set_password('password123')
            demo_user.save()
        users.append(demo_user)
        
        # Create additional users
        for i in range(1, count):
            user, created = User.objects.get_or_create(
                email=f'user{i}@example.com',
                defaults={
                    'name': f'Test User {i}',
                    'is_active': True,
                    'language': random.choice(['fr', 'nl', 'en']),
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)
        
        return users

    def create_companies(self, count):
        """Create demo Belgian companies."""
        companies = []
        
        # Sample Belgian company data
        company_templates = [
            ('Proximus', 'BE0202239951', 'telecommunications', 'SA', 'large', 'Brussels'),
            ('Delhaize', 'BE0402206045', 'retail', 'SA', 'large', 'Brussels'),
            ('AB InBev', 'BE0417497106', 'beverages', 'SA', 'large', 'Leuven'),
            ('Colruyt Group', 'BE0400378485', 'retail', 'SA', 'large', 'Halle'),
            ('Solvay', 'BE0403091220', 'chemicals', 'SA', 'large', 'Brussels'),
            ('UCB', 'BE0403053608', 'pharmaceuticals', 'SA', 'large', 'Brussels'),
            ('Ageas', 'BE0404494849', 'insurance', 'SA', 'large', 'Brussels'),
            ('KBC Group', 'BE0403227515', 'banking', 'SA', 'large', 'Brussels'),
            ('Umicore', 'BE0401574852', 'materials', 'SA', 'large', 'Brussels'),
            ('Elia', 'BE0476388378', 'energy', 'SA', 'large', 'Brussels'),
            ('Telenet', 'BE0439012094', 'telecommunications', 'SA', 'large', 'Mechelen'),
            ('Lotus Bakeries', 'BE0401030860', 'food', 'SA', 'medium', 'Lembeke'),
            ('Barco', 'BE0473191041', 'technology', 'SA', 'medium', 'Kortrijk'),
            ('Melexis', 'BE0435604729', 'semiconductors', 'SA', 'medium', 'Ieper'),
            ('EVS Broadcast', 'BE0452080178', 'broadcasting', 'SA', 'medium', 'Liège'),
            ('Recticel', 'BE0405666668', 'materials', 'SA', 'medium', 'Brussels'),
            ('Tessenderlo Group', 'BE0423159716', 'chemicals', 'SA', 'medium', 'Brussels'),
            ('Bekaert', 'BE0405388536', 'materials', 'SA', 'large', 'Zwevegem'),
            ('D\'Ieteren', 'BE0403448140', 'automotive', 'SA', 'large', 'Brussels'),
            ('Sipef', 'BE0404491285', 'agriculture', 'SA', 'medium', 'Schoten'),
        ]
        
        regions = ['brussels', 'flanders', 'wallonia']
        statuses = ['active', 'active', 'active', 'inactive']  # More active companies
        
        for i, template in enumerate(company_templates[:count]):
            name, vat, sector, legal_form, size, city = template
            
            company, created = Company.objects.get_or_create(
                id=f'BE{i+1000:06d}',
                defaults={
                    'vat': vat,
                    'name': name,
                    'status': random.choice(statuses),
                    'legal_form': legal_form,
                    'creation_date': date.today() - timedelta(days=random.randint(365, 10950)),
                    'employees': random.randint(10, 5000) if size == 'large' else random.randint(5, 250),
                    'sector': sector,
                    'company_size': size,
                    'company_type': 'private-company',
                    'region': random.choice(regions),
                    'city': city,
                    'street': f'Rue de la Loi {random.randint(1, 200)}',
                    'street_number': str(random.randint(1, 100)),
                    'postal_code': f'{random.randint(1000, 9999)}',
                    'website': f'https://www.{name.lower().replace(" ", "")}.be',
                    'email': f'info@{name.lower().replace(" ", "")}.be',
                    'phone': f'+32 {random.randint(2, 9)} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}',
                    'nace_codes': [f'{random.randint(10, 99)}.{random.randint(100, 999)}'],
                    'activity': f'{sector.capitalize()} activities',
                    'company_description': f'{name} is a leading Belgian company in the {sector} sector.',
                }
            )
            companies.append(company)
        
        return companies

    def create_establishments(self, companies):
        """Create establishments for companies."""
        for company in companies:
            # Create 1-3 establishments per company
            for i in range(random.randint(1, 3)):
                Establishment.objects.get_or_create(
                    company=company,
                    unit_number=f'{company.vat}.{i+1:02d}',
                    defaults={
                        'name': f'{company.name} - Site {i+1}',
                        'type': random.choice(['headquarters', 'branch', 'office', 'warehouse']),
                        'street': f'Avenue {random.randint(1, 100)}',
                        'street_number': str(random.randint(1, 200)),
                        'city': random.choice(['Brussels', 'Antwerp', 'Ghent', 'Liège', 'Charleroi']),
                        'postal_code': f'{random.randint(1000, 9999)}',
                        'employees': random.randint(5, 100),
                        'creation_date': company.creation_date + timedelta(days=random.randint(0, 1000)),
                        'status': 'active',
                    }
                )

    def create_financial_data(self, companies):
        """Create financial data for companies."""
        current_year = timezone.now().year
        
        for company in companies:
            # Create 3-5 years of financial data
            for year in range(current_year - random.randint(3, 5), current_year + 1):
                base_revenue = random.randint(100000, 10000000)
                FinancialData.objects.get_or_create(
                    company=company,
                    year=year,
                    defaults={
                        'revenue': base_revenue,
                        'profit': base_revenue * random.uniform(0.05, 0.25),
                        'margin': random.uniform(5, 25),
                        'employees': company.employees or random.randint(10, 500),
                        'extra_data': {
                            'ebitda': base_revenue * random.uniform(0.1, 0.3),
                            'assets': base_revenue * random.uniform(1.5, 3),
                        }
                    }
                )

    def create_groups(self, user, companies):
        """Create sample groups and add companies."""
        groups_data = [
            ('Tech Companies', 'Technology sector companies', 'building', '#3B82F6'),
            ('Retail Sector', 'Retail and distribution companies', 'briefcase', '#10B981'),
            ('Financial Services', 'Banks and insurance companies', 'chart', '#F59E0B'),
            ('Watchlist', 'Companies to monitor', 'star', '#EF4444'),
        ]
        
        for name, description, icon, color in groups_data:
            group, created = CompanyGroup.objects.get_or_create(
                owner=user,
                name=name,
                defaults={
                    'description': description,
                    'icon': icon,
                    'color': color,
                    'is_public': random.choice([True, False]),
                }
            )
            
            if created:
                # Add random companies to the group
                selected_companies = random.sample(companies, k=random.randint(3, 8))
                for position, company in enumerate(selected_companies):
                    GroupMembership.objects.create(
                        group=group,
                        company=company,
                        added_by=user,
                        position=position,
                        notes=f'Added to {name} group'
                    )