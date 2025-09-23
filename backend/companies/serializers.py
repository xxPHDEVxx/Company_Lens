"""
Company serializers for Company Lens API.
Handles serialization/deserialization of company data, establishments, and financial information.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Company, Establishment, FinancialData, CompanyFollower, Activity, Address


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address model."""
    
    streetNumber = serializers.CharField(source='street_number', required=False, allow_blank=True)
    postalBox = serializers.CharField(source='postal_box', required=False, allow_blank=True)
    postalCode = serializers.CharField(source='postal_code', required=False, allow_blank=True)
    fullAddress = serializers.ReadOnlyField(source='full_address')
    
    class Meta:
        model = Address
        fields = [
            'id', 'street', 'streetNumber', 'postalBox', 'postalCode', 
            'city', 'province', 'region', 'country', 'fullAddress',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'fullAddress']


class EstablishmentSerializer(serializers.ModelSerializer):
    """Serializer for Establishment model with nested address."""
    
    address = serializers.SerializerMethodField()
    unitNumber = serializers.CharField(source='unit_number', read_only=True)
    creationDate = serializers.DateField(source='creation_date', read_only=True)
    
    class Meta:
        model = Establishment
        fields = [
            'id', 'unitNumber', 'name', 'address', 
            'creationDate', 'status'
        ]
        read_only_fields = ['id']
    
    def get_address(self, obj):
        """Return address as a nested object."""
        if obj.address:
            return {
                'street': obj.address.street,
                'streetNumber': obj.address.street_number,
                'city': obj.address.city,
                'postalCode': obj.address.postal_code,
                'country': obj.address.country,
                'fullAddress': obj.address.full_address
            }
        return None


class ActivitySerializer(serializers.ModelSerializer):
    """Serializer for Activity model."""
    
    nacebelCodes = serializers.ListField(
        source='nacebel_codes',
        child=serializers.CharField(),
        required=False,
        default=list
    )
    companyActivities = serializers.ListField(
        source='company_activities',
        child=serializers.CharField(),
        required=False,
        default=list
    )
    sectors = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    services = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    primarySector = serializers.ReadOnlyField(source='primary_sector')
    primaryNacebel = serializers.ReadOnlyField(source='primary_nacebel')
    
    class Meta:
        model = Activity
        fields = [
            'id', 'nacebelCodes', 'companyActivities', 'sectors', 
            'services', 'description', 'primarySector', 'primaryNacebel',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FinancialDataSerializer(serializers.ModelSerializer):
    """Serializer for FinancialData model."""
    
    revenue_growth = serializers.SerializerMethodField()
    # Use FloatField to ensure proper JSON numeric serialization
    revenue = serializers.FloatField(required=False)
    profit = serializers.FloatField(required=False)
    margin = serializers.FloatField(required=False)
    
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
    
    def get_revenue_growth(self, obj):
        """Get revenue growth as a float."""
        growth = obj.revenue_growth
        return float(growth) if growth is not None else None


class CompanyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for company listings."""
    
    is_active = serializers.ReadOnlyField()
    is_followed = serializers.SerializerMethodField()
    sector = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    region = serializers.SerializerMethodField()
    
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
    
    def get_sector(self, obj):
        """Get primary sector from activities if available."""
        try:
            if hasattr(obj, 'activities') and obj.activities:
                return obj.activities.primary_sector
        except Activity.DoesNotExist:
            pass
        return None
    
    def get_city(self, obj):
        """Get city from address."""
        return obj.city
    
    def get_region(self, obj):
        """Get region from address."""
        return obj.region


class CompanyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for company with related data."""
    
    address = AddressSerializer(read_only=True)
    full_address = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    city = serializers.SerializerMethodField()  # For backward compatibility
    region = serializers.SerializerMethodField()  # For backward compatibility
    establishments = EstablishmentSerializer(many=True, read_only=True)
    financialData = FinancialDataSerializer(source='financial_data', many=True, read_only=True)
    activities = ActivitySerializer(read_only=True)
    is_followed = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'vat', 'name', 'status', 'legal_form', 'creation_date',
            'fiscal_year', 'last_update', 'capital', 'employees',
            'company_type', 'company_size', 'website', 'phone', 'email', 
            'address', 'city', 'region', 'full_address', 'is_active',
            'activities', 'establishments', 'financialData', 'is_followed',
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
    
    def get_city(self, obj):
        """Get city from address for backward compatibility."""
        return obj.city
    
    def get_region(self, obj):
        """Get region from address for backward compatibility."""
        return obj.region


class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating companies."""
    
    # Address fields for backward compatibility
    street = serializers.CharField(write_only=True, required=False, allow_blank=True)
    street_number = serializers.CharField(source='streetNumber', write_only=True, required=False, allow_blank=True)
    postal_code = serializers.CharField(source='postalCode', write_only=True, required=False, allow_blank=True)
    city = serializers.CharField(write_only=True, required=False, allow_blank=True)
    region = serializers.CharField(write_only=True, required=False, allow_blank=True)
    country = serializers.CharField(write_only=True, required=False, default='BE')
    
    class Meta:
        model = Company
        fields = [
            'id', 'vat', 'name', 'status', 'legal_form', 'creation_date',
            'fiscal_year', 'capital', 'employees', 'company_type', 
            'company_size', 'website', 'phone', 'email', 
            'street', 'street_number', 'postal_code', 'city', 'region', 'country'
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
    
    def create(self, validated_data):
        """Create company with address."""
        # Extract address fields
        address_data = {
            'street': validated_data.pop('street', ''),
            'street_number': validated_data.pop('streetNumber', ''),
            'postal_code': validated_data.pop('postalCode', ''),
            'city': validated_data.pop('city', ''),
            'region': validated_data.pop('region', ''),
            'country': validated_data.pop('country', 'BE'),
        }
        
        # Create company
        company = Company.objects.create(**validated_data)
        
        # Create address if any fields are provided
        if any(address_data.values()):
            address = Address.objects.create(**address_data)
            company.address = address
            company.save()
        
        return company
    
    def update(self, instance, validated_data):
        """Update company with address."""
        # Extract address fields
        address_data = {
            'street': validated_data.pop('street', None),
            'street_number': validated_data.pop('streetNumber', None),
            'postal_code': validated_data.pop('postalCode', None),
            'city': validated_data.pop('city', None),
            'region': validated_data.pop('region', None),
            'country': validated_data.pop('country', None),
        }
        
        # Update company fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update or create address
        if any(v is not None for v in address_data.values()):
            if instance.address:
                # Update existing address
                for key, value in address_data.items():
                    if value is not None:
                        setattr(instance.address, key, value)
                instance.address.save()
            else:
                # Create new address
                filtered_data = {k: v for k, v in address_data.items() if v is not None}
                if filtered_data:
                    address = Address.objects.create(**filtered_data)
                    instance.address = address
                    instance.save()
        
        return instance


class FollowedCompanySerializer(serializers.ModelSerializer):
    """Serializer for companies with follow metadata."""
    
    # Include all company fields
    id = serializers.CharField(source='company.id', read_only=True)
    vat = serializers.CharField(source='company.vat', read_only=True)
    name = serializers.CharField(source='company.name', read_only=True)
    status = serializers.CharField(source='company.status', read_only=True)
    legal_form = serializers.CharField(source='company.legal_form', read_only=True)
    creation_date = serializers.DateField(source='company.creation_date', read_only=True)
    employees = serializers.IntegerField(source='company.employees', read_only=True)
    sector = serializers.SerializerMethodField()
    company_size = serializers.CharField(source='company.company_size', read_only=True)
    region = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    is_active = serializers.BooleanField(source='company.is_active', read_only=True)
    updated_at = serializers.DateTimeField(source='company.updated_at', read_only=True)
    
    # Add follow-specific fields
    followedSince = serializers.DateTimeField(source='followed_since', read_only=True)
    lastUpdate = serializers.DateTimeField(source='company.updated_at', read_only=True)
    is_followed = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyFollower
        fields = [
            'id', 'vat', 'name', 'status', 'legal_form', 'creation_date',
            'employees', 'sector', 'company_size', 'region', 'city',
            'is_active', 'updated_at', 'followedSince', 'lastUpdate', 'is_followed'
        ]
    
    def get_is_followed(self, obj):
        """Always return True since these are followed companies."""
        return True
    
    def get_sector(self, obj):
        """Get primary sector from company's activities."""
        try:
            if hasattr(obj.company, 'activities') and obj.company.activities:
                return obj.company.activities.primary_sector
        except Activity.DoesNotExist:
            pass
        return None
    
    def get_city(self, obj):
        """Get city from company's address."""
        return obj.company.city if obj.company else None
    
    def get_region(self, obj):
        """Get region from company's address."""
        return obj.company.region if obj.company else None


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


class CompanyStatisticsSerializer(serializers.Serializer):
    """Serializer for company statistics."""
    
    total_companies = serializers.IntegerField()
    active_companies = serializers.IntegerField()
    total_employees = serializers.IntegerField()
    by_region = serializers.DictField()
    by_size = serializers.DictField()
    by_sector = serializers.DictField()
    recent_updates = serializers.IntegerField()