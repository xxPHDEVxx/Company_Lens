"""User serializers for Company Lens."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from companies.utils import normalize_vat, validate_vat

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    # Add company name from the associated company
    company_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'company_id', 'company_name', 'phone',
            'avatar', 'bio', 'language', 'email_notifications',
            'is_company_user', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'company_id', 'company_name', 'is_company_user', 'date_joined']

    def get_company_name(self, obj):
        """Get the company name from the company_id."""
        if not obj.company_id:
            return None

        # Import here to avoid circular imports
        from companies.models import Company

        try:
            company = Company.objects.get(vat=obj.company_id)
            return company.name
        except Company.DoesNotExist:
            return None


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
