#!/usr/bin/env python
"""
Quick script to populate database with demo Belgian companies
"""

import os
import sys
import django
from pathlib import Path
from datetime import date, datetime, timedelta
import random

# Setup Django
sys.path.append(str(Path(__file__).parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_lens.settings')
django.setup()

from companies.models import Company, Establishment, FinancialData, CompanyFollower, Activity
from groups.models import CompanyGroup
from users.models import User


def create_demo_data():
    """Create demo Belgian companies and related data"""
    
    print("🔧 Creating demo data...")
    
    # Create a demo user if doesn't exist
    demo_user, created = User.objects.get_or_create(
        email='demo@example.com',
        defaults={
            'name': 'Demo User',
            'is_active': True
        }
    )
    if created:
        demo_user.set_password('demo123')
        demo_user.save()
        print(f"✅ Created demo user: demo@example.com / demo123")
    
    # Belgian companies data
    companies_data = [
        {
            'id': 'comp-001',  # ID is required as it's the primary key
            'vat': 'BE0123456789',
            'name': 'TechInnovate Belgium SA',
            'status': 'active',
            'legal_form': 'SA',
            'company_type': 'for-profit',
            'company_size': 'medium',
            'creation_date': '2010-03-15',
        },
        {
            'id': 'comp-002',
            'vat': 'BE0987654321',
            'name': 'Green Energy Solutions SPRL',
            'status': 'active',
            'legal_form': 'SPRL',
            'company_type': 'for-profit',
            'company_size': 'small',
            'creation_date': '2015-07-22',
        },
        {
            'id': 'comp-003',
            'vat': 'BE0456789123',
            'name': 'Brussels Logistics NV',
            'status': 'active',
            'legal_form': 'NV',
            'company_type': 'for-profit',
            'company_size': 'large',
            'creation_date': '2005-01-10',
        },
        {
            'id': 'comp-004',
            'vat': 'BE0789123456',
            'name': 'Flemish Biotech BVBA',
            'status': 'active',
            'legal_form': 'BVBA',
            'company_type': 'for-profit',
            'company_size': 'medium',
            'creation_date': '2012-09-03',
        },
        {
            'id': 'comp-005',
            'vat': 'BE0321654987',
            'name': 'Walloon Manufacturing SA',
            'status': 'active',
            'legal_form': 'SA',
            'company_type': 'for-profit',
            'company_size': 'large',
            'creation_date': '2000-05-18',
        },
        {
            'id': 'comp-006',
            'vat': 'BE0147258369',
            'name': 'Digital Marketing Agency SRL',
            'status': 'active',
            'legal_form': 'SRL',
            'company_type': 'for-profit',
            'company_size': 'small',
            'creation_date': '2018-11-07',
        },
        {
            'id': 'comp-007',
            'vat': 'BE0963852741',
            'name': 'Belgian Food Exports NV',
            'status': 'active',
            'legal_form': 'NV',
            'company_type': 'for-profit',
            'company_size': 'medium',
            'creation_date': '2008-04-25',
        },
        {
            'id': 'comp-008',
            'vat': 'BE0852741963',
            'name': 'Antwerp Diamonds International',
            'status': 'active',
            'legal_form': 'SA',
            'company_type': 'for-profit',
            'company_size': 'large',
            'creation_date': '1995-02-14',
        },
        {
            'id': 'comp-009',
            'vat': 'BE0741852963',
            'name': 'Healthcare Innovations ASBL',
            'status': 'active',
            'legal_form': 'ASBL',
            'company_type': 'non-profit',
            'company_size': 'small',
            'creation_date': '2016-06-30',
        },
        {
            'id': 'comp-010',
            'vat': 'BE0159357852',
            'name': 'Construction Partners SPRL',
            'status': 'active',
            'legal_form': 'SPRL',
            'company_type': 'for-profit',
            'company_size': 'medium',
            'creation_date': '2013-10-12',
        },
        {
            'id': 'comp-011',
            'vat': 'BE0987654321',
            'name': 'StartUp Venture SRL',
            'status': 'active',
            'legal_form': 'SRL',
            'company_type': 'startup',
            'company_size': 'micro',
            'creation_date': '2024-01-15',
        }
    ]
    
    created_companies = []
    for company_data in companies_data:
        company, created = Company.objects.get_or_create(
            vat=company_data['vat'],
            defaults=company_data
        )
        if created:
            created_companies.append(company)
            print(f"✅ Created company: {company.name}")
            
            # Create Activity record for the company
            activity_descriptions = {
                'TechInnovate Belgium SA': 'Leading technology solutions provider specializing in AI and cloud computing',
                'Green Energy Solutions SPRL': 'Renewable energy solutions for Belgian businesses',
                'Brussels Logistics SA': 'International logistics and supply chain management',
                'BioTech Pharma NV': 'Biotechnology research and pharmaceutical development',
                'Antwerp Manufacturing SRL': 'Industrial manufacturing and automation solutions',
                'Digital Marketing Agency SPRL': 'Digital marketing and social media management',
                'Belgian Food Exports SA': 'Export of Belgian food products worldwide',
                'Diamond Trading Company NV': 'Diamond trading and jewelry manufacturing',
                'Healthcare Innovations ASBL': 'Non-profit healthcare technology for hospitals',
                'Construction Partners SPRL': 'Sustainable construction and renovation services',
                'StartUp Venture SRL': 'Newly established AI startup with single year financials',
            }
            
            # Get sectors based on company type
            sectors_map = {
                'TechInnovate Belgium SA': ['Technology', 'Software', 'Cloud Computing'],
                'Green Energy Solutions SPRL': ['Energy', 'Renewable Energy', 'Environmental'],
                'Brussels Logistics SA': ['Logistics', 'Transportation', 'Supply Chain'],
                'BioTech Pharma NV': ['Biotechnology', 'Pharmaceuticals', 'Healthcare'],
                'Antwerp Manufacturing SRL': ['Manufacturing', 'Industrial', 'Automation'],
                'Digital Marketing Agency SPRL': ['Marketing', 'Digital Services', 'Media'],
                'Belgian Food Exports SA': ['Food & Beverage', 'Export', 'International Trade'],
                'Diamond Trading Company NV': ['Luxury Goods', 'Mining', 'Jewelry'],
                'Healthcare Innovations ASBL': ['Healthcare', 'Technology', 'Non-Profit'],
                'Construction Partners SPRL': ['Construction', 'Real Estate', 'Infrastructure'],
                'StartUp Venture SRL': ['Technology', 'Artificial Intelligence', 'Software'],
            }
            
            Activity.objects.create(
                company=company,
                nacebel_codes=[f"{random.randint(10, 99)}.{random.randint(100, 999)}" for _ in range(random.randint(1, 3))],
                sectors=sectors_map.get(company.name, ['General Business']),
                company_activities=[activity_descriptions.get(company.name, 'General business activities')],
                services=[],
                description=activity_descriptions.get(company.name, '')
            )
            
            # Add financial data 
            # Special case: StartUp Venture SRL only has one year of data
            current_year = datetime.now().year
            
            if company.name == 'StartUp Venture SRL':
                # Only add current year financial data for the startup
                revenue = random.randint(250000, 500000)  # Lower revenue for startup
                profit = int(revenue * random.uniform(-0.10, 0.05))  # Can have losses
                
                FinancialData.objects.create(
                    company=company,
                    year=current_year,
                    revenue=revenue,
                    profit=profit,
                    margin=random.uniform(-10, 5),  # Can have negative margin
                    employees=random.randint(3, 10)  # Small team
                )
                print(f"   📊 Added single year ({current_year}) financial data for startup")
            else:
                # Add 3 years of financial data for established companies
                for year_offset in range(3):
                    year = current_year - year_offset
                    revenue = random.randint(500000, 10000000)
                    profit = int(revenue * random.uniform(0.05, 0.25))
                    
                    FinancialData.objects.create(
                        company=company,
                        year=year,
                        revenue=revenue,
                        profit=profit,
                        margin=random.uniform(5, 25),  # Profit margin as percentage
                        employees=random.randint(10, 500)
                    )
            
            # Add establishments
            Establishment.objects.create(
                company=company,
                unit_number=f"2.{company.vat[2:]}",  # Changed from establishment_number
                name=f"{company.name} - Headquarters",
                street='Avenue Louise',
                street_number='100',
                city='Brussels',
                postal_code='1050',
                country='BE',
                status='active',
                creation_date=company.creation_date  # Changed from start_date
            )
    
    # Create demo groups
    if created_companies:
        tech_group, created = CompanyGroup.objects.get_or_create(
            owner=demo_user,  # Changed from user to owner
            name='Tech Companies',
            defaults={
                'description': 'Technology and IT companies',
                'icon': 'building',  # Must be from ICON_CHOICES
                'color': '#3B82F6'
            }
        )
        
        manufacturing_group, created = CompanyGroup.objects.get_or_create(
            owner=demo_user,  # Changed from user to owner
            name='Manufacturing',
            defaults={
                'description': 'Manufacturing and industrial companies',
                'icon': 'briefcase',  # Must be from ICON_CHOICES
                'color': '#10B981'
            }
        )
        
        # Add some companies to groups
        for company in created_companies[:3]:
            tech_group.companies.add(company)
        for company in created_companies[3:6]:
            manufacturing_group.companies.add(company)
        
        print(f"✅ Created groups with companies")
    
    # Add some companies to user's followed list using CompanyFollower
    for company in created_companies[:5]:
        CompanyFollower.objects.get_or_create(
            user=demo_user,
            company=company,
            defaults={'notify_updates': True}
        )
    
    print(f"\n✨ Demo data created successfully!")
    print(f"   - {len(created_companies)} companies")
    print(f"   - {FinancialData.objects.count()} financial records")
    print(f"   - {Establishment.objects.count()} establishments")
    print(f"   - {CompanyGroup.objects.count()} groups")
    print(f"\n📝 Demo credentials:")
    print(f"   Email: demo@example.com")
    print(f"   Password: demo123")
    print(f"\n🌐 Access at:")
    print(f"   Admin: http://localhost:8000/admin/")
    print(f"   API: http://localhost:8000/api/")


if __name__ == '__main__':
    create_demo_data()