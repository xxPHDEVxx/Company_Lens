"""
Group serializers for Company Lens API.
Handles serialization/deserialization of company groups and sharing.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .models import CompanyGroup, GroupMembership
from companies.models import Company
from companies.serializers import CompanyListSerializer

User = get_user_model()


class GroupMembershipSerializer(serializers.ModelSerializer):
    """Serializer for group membership details."""
    
    company = CompanyListSerializer(read_only=True)
    company_id = serializers.CharField(write_only=True)
    added_by_name = serializers.CharField(source='added_by.name', read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = [
            'id', 'company', 'company_id', 'position', 'added_at', 'added_by',
            'added_by_name'
        ]
        read_only_fields = ['id', 'added_at', 'added_by', 'added_by_name']


class CompanyGroupListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for group listings."""
    
    companies_count = serializers.ReadOnlyField()
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    
    class Meta:
        model = CompanyGroup
        fields = [
            'id', 'name', 'description', 'icon', 'position',
            'companies_count', 'owner_name', 'created_at'
        ]
        read_only_fields = ['id', 'position', 'companies_count', 'owner_name', 'created_at']


class CompanyGroupDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for company group with members."""
    
    companies_count = serializers.ReadOnlyField()
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    memberships = GroupMembershipSerializer(
        source='groupmembership_set', many=True, read_only=True
    )
    
    class Meta:
        model = CompanyGroup
        fields = [
            'id', 'name', 'description', 'icon', 'position',
            'companies_count', 'owner', 'owner_name', 'owner_email',
            'memberships', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'position', 'companies_count', 'owner', 'owner_name', 'owner_email',
            'created_at', 'updated_at'
        ]
    


class CompanyGroupCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating company groups."""
    
    class Meta:
        model = CompanyGroup
        fields = ['id', 'name', 'description', 'icon']
        read_only_fields = ['id']
        extra_kwargs = {
            'name': {'required': True},
            'description': {'required': False, 'allow_blank': True},
        }
    
    def validate_name(self, value):
        """Validate group name is unique for the user."""
        user = self.context['request'].user
        
        # Check for existing group with same name
        queryset = CompanyGroup.objects.filter(owner=user, name=value)
        
        # If updating, exclude current instance
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                'Vous avez déjà un groupe avec ce nom.'
            )
        
        return value


class AddCompaniesToGroupSerializer(serializers.Serializer):
    """Serializer for adding companies to a group."""
    
    company_ids = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        allow_empty=False,
        help_text=_('List of company IDs to add to the group')
    )
    
    def validate_company_ids(self, value):
        """Validate all company IDs exist."""
        invalid_ids = []
        for company_id in value:
            if not Company.objects.filter(id=company_id).exists():
                invalid_ids.append(company_id)
        
        if invalid_ids:
            raise serializers.ValidationError(
                _('The following company IDs do not exist: %(ids)s') % {
                    'ids': ', '.join(invalid_ids)
                }
            )
        
        return value
    
    def create(self, validated_data):
        """Add companies to the group."""
        group = self.context['group']
        user = self.context['request'].user
        company_ids = validated_data['company_ids']
        
        # Get the current max position in the group
        from django.db.models import Max
        max_position = group.groupmembership_set.aggregate(
            max_pos=Max('position')
        )['max_pos'] or -1
        
        memberships = []
        for i, company_id in enumerate(company_ids):
            company = Company.objects.get(id=company_id)
            membership, created = GroupMembership.objects.get_or_create(
                group=group,
                company=company,
                defaults={
                    'added_by': user,
                    'position': max_position + i + 1
                }
            )
            if created:
                memberships.append(membership)
        
        return {'added_count': len(memberships), 'memberships': memberships}


class RemoveCompanyFromGroupSerializer(serializers.Serializer):
    """Serializer for removing a company from a group."""
    
    company_id = serializers.CharField(
        required=True,
        help_text=_('Company ID to remove from the group')
    )
    
    def validate_company_id(self, value):
        """Validate company is in the group."""
        group = self.context['group']
        if not GroupMembership.objects.filter(
            group=group,
            company_id=value
        ).exists():
            raise serializers.ValidationError(
                _('This company is not in the group.')
            )
        return value


# Sharing serializers removed - groups are private to their creators


class GroupStatisticsSerializer(serializers.Serializer):
    """Serializer for group statistics."""
    
    total_groups = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    groups_by_icon = serializers.DictField()
    average_group_size = serializers.FloatField()