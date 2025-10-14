"""User serializers for Company Lens."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from companies.utils import normalize_vat, validate_vat

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
        """
        Normalize and validate VAT number.

        Uses centralized VAT utility for consistent normalization across the app.
        """
        try:
            normalized_vat = normalize_vat(value)

            # Double-check the normalized value is valid
            if not validate_vat(normalized_vat):
                raise ValueError("Normalization produced invalid VAT")

            return normalized_vat

        except ValueError as e:
            raise serializers.ValidationError(str(e))
