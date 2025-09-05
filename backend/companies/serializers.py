"""
Company serializers for Company Lens API.
Handles serialization/deserialization of company data, establishments, and financial information.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Company, Establishment, FinancialData, CompanyFollower


class EstablishmentSerializer(serializers.ModelSerializer):
    """Serializer for Establishment model."""
    
    full_address = serializers.ReadOnlyField()
    
    class Meta:
        model = Establishment
        fields = [
            'id', 'unit_number', 'name', 'type', 'street', 'street_number',
            'city', 'postal_code', 'country', 'phone', 'email',
            'employees', 'creation_date', 'status', 'full_address',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_address']


class FinancialDataSerializer(serializers.ModelSerializer):
    """Serializer for FinancialData model."""
    
    revenue_growth = serializers.ReadOnlyField()
    
    class Meta:
        model = FinancialData
        fields = [
            'id', 'year', 'revenue', 'profit', 'margin', 'employees',
            'revenue_growth', 'extra_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'revenue_growth', 'created_at', 'updated_at']
    
    def validate_year(self, value):
        """Validate year is reasonable."""
        import datetime
        current_year = datetime.datetime.now().year
        if value < 1900 or value > current_year + 1:
            raise serializers.ValidationError(
                _('Year must be between 1900 and %(year)s') % {'year': current_year + 1}
            )
        return value


class CompanyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for company listings."""
    
    is_active = serializers.ReadOnlyField()
    is_followed = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'vat', 'name', 'status', 'legal_form', 'creation_date',
            'employees', 'sector', 'company_size', 'region', 'city',
            'is_active', 'is_followed', 'updated_at'
        ]
        read_only_fields = ['is_active', 'is_followed', 'updated_at']
    
    def get_is_followed(self, obj):
        """Check if current user follows this company."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CompanyFollower.objects.filter(
                user=request.user,
                company=obj
            ).exists()
        return False


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for company with related data."""
    
    full_address = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    establishments = EstablishmentSerializer(many=True, read_only=True)
    financial_data = FinancialDataSerializer(many=True, read_only=True)
    is_followed = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'vat', 'name', 'status', 'legal_form', 'creation_date',
            'fiscal_year', 'last_update', 'capital', 'employees',
            'nace_codes', 'activity', 'sector', 'company_type',
            'company_size', 'company_description', 'region', 'city',
            'website', 'phone', 'email', 'street', 'street_number',
            'postal_code', 'country', 'full_address', 'is_active',
            'establishments', 'financial_data', 'is_followed',
            'followers_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'full_address', 'is_active', 'is_followed', 'followers_count',
            'created_at', 'updated_at', 'last_update'
        ]
    
    def get_is_followed(self, obj):
        """Check if current user follows this company."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CompanyFollower.objects.filter(
                user=request.user,
                company=obj
            ).exists()
        return False
    
    def get_followers_count(self, obj):
        """Get number of users following this company."""
        return obj.followers.count()


class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating companies."""
    
    class Meta:
        model = Company
        fields = [
            'id', 'vat', 'name', 'status', 'legal_form', 'creation_date',
            'fiscal_year', 'capital', 'employees', 'nace_codes', 'activity',
            'sector', 'company_type', 'company_size', 'company_description',
            'region', 'city', 'website', 'phone', 'email', 'street',
            'street_number', 'postal_code', 'country'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'vat': {'required': True},
            'name': {'required': True},
        }
    
    def validate_vat(self, value):
        """Validate VAT number format."""
        # Remove spaces and convert to uppercase
        vat = value.upper().replace(' ', '').replace('.', '')
        
        # Check format
        if not vat.startswith('BE') or len(vat) != 12:
            raise serializers.ValidationError(
                _('VAT number must be in format BE0123456789')
            )
        
        # Check if all characters after BE are digits
        if not vat[2:].isdigit():
            raise serializers.ValidationError(
                _('VAT number must contain only digits after BE')
            )
        
        # TODO: NEEDS YOUR INPUT - Add VAT checksum validation if required
        # Belgian VAT numbers have a checksum algorithm
        
        return vat


class CompanyFollowerSerializer(serializers.ModelSerializer):
    """Serializer for company followers."""
    
    company = CompanyListSerializer(read_only=True)
    company_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = CompanyFollower
        fields = [
            'id', 'company', 'company_id', 'followed_since', 'notify_updates'
        ]
        read_only_fields = ['id', 'followed_since']
    
    def validate_company_id(self, value):
        """Validate company exists."""
        try:
            Company.objects.get(id=value)
        except Company.DoesNotExist:
            raise serializers.ValidationError(
                _('Company with this ID does not exist.')
            )
        return value
    
    def create(self, validated_data):
        """Create a new follower relationship."""
        company_id = validated_data.pop('company_id')
        company = Company.objects.get(id=company_id)
        
        # Check if already following
        user = self.context['request'].user
        if CompanyFollower.objects.filter(user=user, company=company).exists():
            raise serializers.ValidationError(
                _('You are already following this company.')
            )
        
        return CompanyFollower.objects.create(
            user=user,
            company=company,
            **validated_data
        )


class CompanySearchSerializer(serializers.Serializer):
    """Serializer for company search parameters."""
    
    SEARCH_TYPE_CHOICES = [
        ('vat', 'VAT Number'),
        ('name', 'Company Name'),
        ('city', 'City'),
        ('sector', 'Sector'),
        ('nace', 'NACE Code'),
    ]
    
    query = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('Search query string')
    )
    search_type = serializers.ChoiceField(
        choices=SEARCH_TYPE_CHOICES,
        default='name',
        help_text=_('Type of search to perform')
    )
    region = serializers.ChoiceField(
        choices=Company.REGION_CHOICES,
        required=False,
        allow_blank=True,
        help_text=_('Filter by region')
    )
    status = serializers.ChoiceField(
        choices=Company.STATUS_CHOICES,
        required=False,
        allow_blank=True,
        help_text=_('Filter by company status')
    )
    company_size = serializers.ChoiceField(
        choices=Company.COMPANY_SIZE_CHOICES,
        required=False,
        allow_blank=True,
        help_text=_('Filter by company size')
    )
    min_employees = serializers.IntegerField(
        required=False,
        min_value=0,
        help_text=_('Minimum number of employees')
    )
    max_employees = serializers.IntegerField(
        required=False,
        min_value=0,
        help_text=_('Maximum number of employees')
    )
    
    def validate(self, attrs):
        """Validate search parameters."""
        # Ensure min <= max for employees
        min_emp = attrs.get('min_employees')
        max_emp = attrs.get('max_employees')
        if min_emp and max_emp and min_emp > max_emp:
            raise serializers.ValidationError({
                'max_employees': _('Maximum employees must be greater than minimum.')
            })
        
        return attrs


class CompanyStatisticsSerializer(serializers.Serializer):
    """Serializer for company statistics."""
    
    total_companies = serializers.IntegerField()
    active_companies = serializers.IntegerField()
    total_employees = serializers.IntegerField()
    by_region = serializers.DictField()
    by_size = serializers.DictField()
    by_sector = serializers.DictField()
    recent_updates = serializers.IntegerField()