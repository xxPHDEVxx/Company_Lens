#!/usr/bin/env python
"""Script to reset demo user password."""

import os
import django
import sys

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'company_lens.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Reset demo user password
try:
    user = User.objects.get(email='demo@example.com')
    user.set_password('demo123')  # Set the password
    user.is_active = True  # Ensure user is active
    user.is_staff = True  # Give admin access
    user.save()
    print(f"✅ Password reset successfully for {user.email}")
    print(f"   Email: demo@example.com")
    print(f"   Password: demo123")
except User.DoesNotExist:
    # Create the demo user if it doesn't exist
    user = User.objects.create_user(
        email='demo@example.com',
        password='demo123',
        name='Demo User',
        is_staff=True,
        is_active=True
    )
    print(f"✅ Demo user created successfully")
    print(f"   Email: demo@example.com")
    print(f"   Password: demo123")