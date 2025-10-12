#!/usr/bin/env python
"""
Populate database with comprehensive demo data for Company Lens.
Creates 10 groups, 30 companies with various data completeness levels.
"""

import os
import sys
import random
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path

# Add the parent directory to the path
sys.path.append(str(Path(__file__).parent.parent))

# Setup Django  
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_lens.settings')
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company, Establishment, FinancialData, Activity, Address, CompanyFollower
from groups.models import CompanyGroup, GroupMembership
from search.models import RecentSearch

User = get_user_model()

# Belgian cities and regions
BELGIAN_CITIES = {
    'brussels': [
        ('Bruxelles', '1000'),
        ('Ixelles', '1050'),
        ('Saint-Gilles', '1060'),
        ('Etterbeek', '1040'),
        ('Woluwe-Saint-Lambert', '1200'),
    ],
    'flanders': [
        ('Anvers', '2000'),
        ('Gand', '9000'),
        ('Bruges', '8000'),
        ('Louvain', '3000'),
        ('Malines', '2800'),
        ('Hasselt', '3500'),
        ('Courtrai', '8500'),
        ('Ostende', '8400'),
    ],
    'wallonia': [
        ('Liège', '4000'),
        ('Namur', '5000'),
        ('Charleroi', '6000'),
        ('Mons', '7000'),
        ('Tournai', '7500'),
        ('Verviers', '4800'),
        ('Arlon', '6700'),
    ],
}

# Street names
STREETS = [
    'Rue de la Loi',
    'Avenue Louise',
    'Boulevard Anspach',
    'Chaussée de Charleroi',
    'Avenue de la Toison d\'Or',
    'Rue Neuve',
    'Place du Luxembourg',
    'Boulevard du Souverain',
    'Avenue de Tervueren',
    'Rue Belliard',
    'Avenue des Arts',
    'Rue de Namur',
    'Boulevard Saint-Michel',
    'Avenue du Port',
    'Rue des Fripiers',
]

# Company name components for generation
COMPANY_PREFIXES = [
    'Tech', 'Digital', 'Euro', 'Belgian', 'Global', 'Smart', 'Green', 'Future',
    'Innovation', 'Advanced', 'Premier', 'Elite', 'Dynamic', 'Strategic', 'Alpha',
]

COMPANY_SUFFIXES = [
    'Solutions', 'Systems', 'Group', 'Partners', 'Consulting', 'Ventures', 'Holdings',
    'Industries', 'Technologies', 'Services', 'International', 'Labs', 'Dynamics', 'Hub',
]

SECTORS = [
    'Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Construction',
    'Energy', 'Transportation', 'Real Estate', 'Education', 'Hospitality', 'Agriculture',
    'Media', 'Telecommunications', 'Pharmaceutical', 'Automotive', 'Aerospace', 'Logistics',
]

ACTIVITIES = [
    'Software Development', 'Data Analytics', 'Cloud Services', 'Cybersecurity',
    'Financial Services', 'Investment Management', 'Insurance', 'Medical Devices',
    'Biotechnology', 'E-commerce', 'Supply Chain Management', 'Renewable Energy',
    'Construction Management', 'Consulting Services', 'Marketing Services',
    'Research & Development', 'Manufacturing', 'Distribution', 'Wholesale Trade',
]

SERVICES = [
    'Consulting', 'Implementation', 'Support', 'Training', 'Maintenance',
    'Development', 'Integration', 'Migration', 'Optimization', 'Automation',
    'Analysis', 'Design', 'Architecture', 'Project Management', 'Quality Assurance',
]

NACEBEL_CODES = [
    '62010', '62020', '62030', '62090',  # IT services
    '64190', '64200', '64300', '64910',  # Financial services
    '70100', '70210', '70220',           # Management consultancy
    '46510', '46900', '47110',           # Wholesale and retail
    '41200', '43210', '43990',           # Construction
    '72110', '72190', '72200',           # R&D
]

def clear_database():
    """Clear existing demo data."""
    print("🧹 Clearing existing data...")
    RecentSearch.objects.all().delete()
    GroupMembership.objects.all().delete()
    CompanyGroup.objects.all().delete()
    CompanyFollower.objects.all().delete()
    FinancialData.objects.all().delete()
    Activity.objects.all().delete()
    Establishment.objects.all().delete()
    Company.objects.all().delete()
    Address.objects.all().delete()
    print("✅ Database cleared")

def create_demo_user():
    """Create or get the demo user."""
    email = 'demo@example.com'
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'name': 'Demo User',
            'is_active': True,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        user.set_password('demo123')
        user.save()
        print(f"✅ Created demo superuser: {email}")
    else:
        user.set_password('demo123')
        user.save()
        print(f"✅ Using existing demo user: {email}")
    return user

def create_groups(user):
    """Create 10 diverse groups for the demo user."""
    # Valid icons from ICON_CHOICES: competitive, partnership, supplier, client, finance, technology, manufacturing, services, folder
    groups_data = [
        {
            'name': 'Startups Belges',
            'description': 'Jeunes entreprises innovantes en Belgique',
            'icon': 'technology',
        },
        {
            'name': 'Fournisseurs Principaux',
            'description': 'Nos fournisseurs stratégiques et partenaires clés',
            'icon': 'supplier',
        },
        {
            'name': 'Clients Enterprise',
            'description': 'Grands comptes et clients entreprise',
            'icon': 'client',
        },
        {
            'name': 'Secteur Technologie',
            'description': 'Entreprises du secteur technologique',
            'icon': 'technology',
        },
        {
            'name': 'PME Wallonnes',
            'description': 'Petites et moyennes entreprises en Wallonie',
            'icon': 'manufacturing',
        },
        {
            'name': 'Partenaires Stratégiques',
            'description': 'Partenaires commerciaux stratégiques',
            'icon': 'partnership',
        },
        {
            'name': 'Concurrents',
            'description': 'Analyse concurrentielle du marché',
            'icon': 'competitive',
        },
        {
            'name': 'Prospects Q4 2024',
            'description': 'Opportunités commerciales pour Q4 2024',
            'icon': 'folder',
        },
        {
            'name': 'Entreprises Durables',
            'description': 'Entreprises avec initiatives écologiques',
            'icon': 'services',
        },
        {
            'name': 'Acquisitions Potentielles',
            'description': 'Cibles potentielles pour M&A',
            'icon': 'finance',
        },
    ]
    
    groups = []
    for data in groups_data:
        group = CompanyGroup.objects.create(
            owner=user,
            name=data['name'],
            description=data['description'],
            icon=data['icon'],
        )
        groups.append(group)
        print(f"✅ Created group: {group.name}")
    
    return groups

def generate_vat_number(index):
    """Generate a valid Belgian VAT number."""
    # Belgian VAT numbers: BE + 10 digits (0 + 9 digits)
    return f"BE0{400000000 + index}"

def create_companies(user, groups):
    """Create 30 companies with varying levels of completeness."""
    companies = []
    
    for i in range(30):
        # Determine company characteristics
        vat = generate_vat_number(i)
        company_id = f"company_{i+1}"
        
        # Generate company name
        prefix = random.choice(COMPANY_PREFIXES)
        suffix = random.choice(COMPANY_SUFFIXES)
        company_name = f"{prefix} {suffix}"
        if random.random() > 0.7:  # 30% chance of adding a legal form to name
            company_name += random.choice([' SA', ' SRL', ' SPRL'])
        
        # Determine data completeness level
        completeness = get_completeness_level(i)
        
        # Choose region and city
        region = random.choice(list(BELGIAN_CITIES.keys()))
        city, postal_code = random.choice(BELGIAN_CITIES[region])
        
        # Create address (always create for companies)
        address = Address.objects.create(
            street=random.choice(STREETS),
            street_number=str(random.randint(1, 200)),
            postal_box=f"Box {random.randint(1, 50)}" if random.random() > 0.7 else '',
            postal_code=postal_code,
            city=city,
            province=city,  # Using city as province for simplicity
            region=region,
            country='BE'
        )
        
        # Create company with varying completeness
        company_data = {
            'id': company_id,
            'vat': vat,
            'name': company_name,
            'status': get_company_status(completeness),
            'legal_form': get_legal_form(completeness),
            'address': address,
        }
        
        # Add optional fields based on completeness
        if completeness in ['complete', 'mostly_complete', 'partial']:
            company_data['creation_date'] = date(
                random.randint(1990, 2023),
                random.randint(1, 12),
                random.randint(1, 28)
            )
            company_data['company_size'] = get_company_size(completeness)
            company_data['company_type'] = get_company_type(completeness)
        
        if completeness in ['complete', 'mostly_complete']:
            company_data['capital'] = f"€{random.randint(10, 500) * 1000:,}"
            company_data['employees'] = random.randint(1, 500)
            company_data['fiscal_year'] = '31/12'
            company_data['website'] = f"https://www.{prefix.lower()}{suffix.lower()}.be"
            company_data['phone'] = f"+32 {random.randint(2, 9)} {random.randint(100, 999)} {random.randint(10, 99)} {random.randint(10, 99)}"
            company_data['email'] = f"contact@{prefix.lower()}{suffix.lower()}.be"
        
        # Create company
        company = Company.objects.create(**company_data)
        companies.append(company)
        
        # Create Activity based on completeness
        if completeness != 'minimal':
            create_activity(company, completeness)
        
        # Create Financial Data based on completeness
        if completeness in ['complete', 'mostly_complete', 'partial']:
            create_financial_data(company, completeness)
        
        # Create Establishments based on completeness
        if completeness in ['complete', 'mostly_complete'] and random.random() > 0.5:
            create_establishments(company, completeness)
        
        # Follow some companies
        if random.random() > 0.6:  # 40% chance of following
            CompanyFollower.objects.get_or_create(
                user=user,
                company=company,
                defaults={'notify_updates': random.choice([True, False])}
            )
        
        # Add to groups
        num_groups = random.randint(0, 3)
        selected_groups = random.sample(groups, min(num_groups, len(groups)))
        for group in selected_groups:
            position = GroupMembership.objects.filter(group=group).count()
            GroupMembership.objects.get_or_create(
                group=group,
                company=company,
                defaults={'position': position, 'added_by': user}
            )
        
        print(f"✅ Created company {i+1}/30: {company.name} ({completeness})")
    
    return companies

def get_completeness_level(index):
    """Determine completeness level based on index."""
    if index < 5:
        return 'complete'  # 5 companies with complete data
    elif index < 12:
        return 'mostly_complete'  # 7 companies mostly complete
    elif index < 20:
        return 'partial'  # 8 companies with partial data
    else:
        return 'minimal'  # 10 companies with minimal data

def get_company_status(completeness):
    """Get company status based on completeness."""
    if completeness == 'minimal':
        return random.choice(['active', 'inactive', 'dissolved'])
    elif completeness == 'partial':
        return random.choice(['active', 'inactive'])
    else:
        return 'active'

def get_legal_form(completeness):
    """Get legal form based on completeness."""
    if completeness == 'minimal':
        return ''
    forms = ['SA', 'SRL', 'SPRL', 'SC', 'ASBL']
    if completeness == 'complete':
        return random.choice(forms)
    else:
        return random.choice(forms[:3])  # Only common forms

def get_company_size(completeness):
    """Get company size based on completeness."""
    if completeness == 'complete':
        return random.choice(['micro', 'small', 'medium', 'large'])
    elif completeness == 'mostly_complete':
        return random.choice(['small', 'medium'])
    else:
        return random.choice(['micro', 'small'])

def get_company_type(completeness):
    """Get company type based on completeness."""
    types = ['private-company', 'public-company', 'non-profit', 'startup']
    if completeness == 'complete':
        return random.choice(types)
    else:
        return random.choice(types[:2])

def create_activity(company, completeness):
    """Create activity for a company based on completeness."""
    activity_data = {
        'company': company,
        'nacebel_codes': [],
        'sectors': [],
        'services': [],
        'company_activities': [],
    }
    
    if completeness == 'complete':
        activity_data['nacebel_codes'] = random.sample(NACEBEL_CODES, random.randint(1, 3))
        activity_data['sectors'] = random.sample(SECTORS, random.randint(1, 3))
        activity_data['services'] = random.sample(SERVICES, random.randint(2, 5))
        activity_data['company_activities'] = random.sample(ACTIVITIES, random.randint(2, 4))
        activity_data['description'] = f"{company.name} est une entreprise leader dans le domaine de {activity_data['sectors'][0].lower()}, " \
                                      f"spécialisée dans {', '.join(activity_data['company_activities'][:2]).lower()}."
    elif completeness == 'mostly_complete':
        activity_data['nacebel_codes'] = random.sample(NACEBEL_CODES, 1)
        activity_data['sectors'] = random.sample(SECTORS, random.randint(1, 2))
        activity_data['company_activities'] = random.sample(ACTIVITIES, random.randint(1, 3))
        activity_data['description'] = f"Entreprise active dans le secteur {activity_data['sectors'][0].lower()}."
    elif completeness == 'partial':
        activity_data['sectors'] = random.sample(SECTORS, 1)
        activity_data['company_activities'] = random.sample(ACTIVITIES, 1)
    
    Activity.objects.create(**activity_data)

def create_financial_data(company, completeness):
    """Create financial data for a company based on completeness."""
    current_year = datetime.now().year
    
    if completeness == 'complete':
        # Create 3 years of financial data
        years = range(current_year - 2, current_year + 1)
    elif completeness == 'mostly_complete':
        # Create 2 years of financial data
        years = range(current_year - 1, current_year + 1)
    else:  # partial
        # Create 1 year of financial data
        years = [current_year]
    
    base_revenue = random.randint(100000, 10000000)
    base_employees = random.randint(5, 200)
    
    for i, year in enumerate(years):
        # Simulate growth or decline
        growth_factor = 1 + random.uniform(-0.2, 0.3)
        revenue = int(base_revenue * (growth_factor ** i))
        
        # Calculate profit and margin
        if completeness == 'complete':
            margin = random.uniform(5, 25)  # 5-25% margin
            profit = int(revenue * margin / 100)
            employees = int(base_employees * (1 + i * 0.1))
        elif completeness == 'mostly_complete':
            margin = random.uniform(0, 20) if random.random() > 0.3 else None
            profit = int(revenue * margin / 100) if margin else None
            employees = base_employees if random.random() > 0.5 else None
        else:  # partial
            margin = None
            profit = None
            employees = None
        
        FinancialData.objects.create(
            company=company,
            year=year,
            revenue=revenue,
            profit=profit,
            margin=margin,
            employees=employees,
            extra_data={
                'data_quality': completeness,
                'source': 'demo_data'
            }
        )

def create_establishments(company, completeness):
    """Create establishments for a company based on completeness."""
    num_establishments = random.randint(1, 3) if completeness == 'complete' else 1
    
    for i in range(num_establishments):
        # Choose a different city than the main office
        region = random.choice(list(BELGIAN_CITIES.keys()))
        city, postal_code = random.choice(BELGIAN_CITIES[region])
        
        # Create address for establishment
        address = Address.objects.create(
            street=random.choice(STREETS),
            street_number=str(random.randint(1, 200)),
            postal_code=postal_code,
            city=city,
            province=city,
            region=region,
            country='BE'
        )
        
        establishment_data = {
            'company': company,
            'unit_number': f"2.{random.randint(100, 999)}.{random.randint(100, 999)}.{random.randint(100, 999)}",
            'name': f"{company.name} - {city}",
            'address': address,
            'status': 'active' if completeness == 'complete' else random.choice(['active', 'inactive']),
        }
        
        if completeness == 'complete':
            establishment_data['creation_date'] = company.creation_date + timedelta(days=random.randint(365, 3650))
        
        Establishment.objects.create(**establishment_data)

def create_recent_searches(user, companies):
    """Create recent searches for the demo user."""
    # Select random companies for recent searches
    searched_companies = random.sample(companies, min(8, len(companies)))
    
    for company in searched_companies:
        RecentSearch.objects.create(
            user=user,
            name=company.name,
            vat=company.vat,
            company_id=company.id
        )
    
    print(f"✅ Created {len(searched_companies)} recent searches")

def main():
    """Main function to populate the database."""
    print("\n" + "="*50)
    print("🚀 STARTING DATABASE POPULATION")
    print("="*50 + "\n")
    
    # Clear existing data
    clear_database()
    
    # Create demo user
    user = create_demo_user()
    
    # Create groups
    groups = create_groups(user)
    
    # Create companies
    companies = create_companies(user, groups)
    
    # Create recent searches
    create_recent_searches(user, companies)
    
    # Print summary
    print("\n" + "="*50)
    print("✨ DATABASE POPULATION COMPLETE!")
    print("="*50)
    print(f"\n📊 Summary:")
    print(f"  ✓ User: demo@example.com (password: demo123)")
    print(f"  ✓ Groups: {CompanyGroup.objects.filter(owner=user).count()}")
    print(f"  ✓ Companies: {Company.objects.count()}")
    print(f"    - Complete data: 5 companies")
    print(f"    - Mostly complete: 7 companies")
    print(f"    - Partial data: 8 companies")
    print(f"    - Minimal data: 10 companies")
    print(f"  ✓ Financial records: {FinancialData.objects.count()}")
    print(f"  ✓ Establishments: {Establishment.objects.count()}")
    print(f"  ✓ Activities: {Activity.objects.count()}")
    print(f"  ✓ Companies followed: {CompanyFollower.objects.filter(user=user).count()}")
    print(f"  ✓ Recent searches: {RecentSearch.objects.filter(user=user).count()}")
    print("\n🌐 Access the application:")
    print(f"  Frontend: http://localhost:5173")
    print(f"  Backend: http://localhost:8000")
    print(f"  Admin: http://localhost:8000/admin")
    print("="*50 + "\n")

if __name__ == '__main__':
    main()