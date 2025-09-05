#!/usr/bin/env python
"""
Script to create a superuser for development.
Usage: python create_superuser.py
"""

import os
import sys
import django

# Add the project directory to the sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_lens.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Default superuser credentials for development
DEFAULT_EMAIL = 'admin@companylens.be'
DEFAULT_PASSWORD = 'admin123'
DEFAULT_NAME = 'Admin User'

def create_superuser():
    """Create a superuser if it doesn't exist."""
    if User.objects.filter(email=DEFAULT_EMAIL).exists():
        print(f"Superuser '{DEFAULT_EMAIL}' already exists.")
        return
    
    user = User.objects.create_superuser(
        email=DEFAULT_EMAIL,
        password=DEFAULT_PASSWORD,
        name=DEFAULT_NAME
    )
    
    print(f"Superuser created successfully!")
    print(f"Email: {DEFAULT_EMAIL}")
    print(f"Password: {DEFAULT_PASSWORD}")
    print(f"You can now login at http://localhost:8000/admin/")

if __name__ == '__main__':
    create_superuser()