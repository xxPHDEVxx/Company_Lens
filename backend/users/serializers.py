"""User serializers for Company Lens."""

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'company_id', 'phone',
            'avatar', 'bio', 'language', 'email_notifications',
            'is_company_user', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'company_id', 'is_company_user', 'date_joined']


class AssociateCompanySerializer(serializers.Serializer):
    """Serializer for associating a company with a user."""

    company_vat = serializers.CharField(
        max_length=20,
        required=True,
        help_text='Belgian VAT number (format: BE0123456789 or 0123456789)'
    )

    def validate_company_vat(self, value):
        """Normalize and validate VAT number."""
        # Remove spaces and dots
        vat = value.upper().replace(' ', '').replace('.', '')

        # Add BE prefix if missing
        if not vat.startswith('BE'):
            vat = 'BE' + vat.lstrip('0')

        # Ensure BE + 10 digits format
        if vat.startswith('BE') and len(vat) < 12:
            vat = 'BE' + vat[2:].zfill(10)

        # Validate format
        if not vat.startswith('BE') or len(vat) != 12:
            raise serializers.ValidationError(
                'Invalid VAT format. Expected BE + 10 digits (e.g., BE0123456789)'
            )

        return vat
