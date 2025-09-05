"""
Group serializers for Company Lens API.
Handles serialization/deserialization of company groups and sharing.
"""

from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from .models import CompanyGroup, GroupMembership, SharedGroup
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
            'id', 'company', 'company_id', 'added_at', 'added_by',
            'added_by_name', 'notes', 'position'
        ]
        read_only_fields = ['id', 'added_at', 'added_by', 'added_by_name']


class CompanyGroupListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for group listings."""
    
    companies_count = serializers.ReadOnlyField()
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    is_shared = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyGroup
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'is_public',
            'companies_count', 'owner_name', 'is_shared', 'created_at'
        ]
        read_only_fields = ['id', 'companies_count', 'owner_name', 'is_shared', 'created_at']
    
    def get_is_shared(self, obj):
        """Check if group is shared with anyone."""
        return obj.shares.exists()


class CompanyGroupDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for company group with members."""
    
    companies_count = serializers.ReadOnlyField()
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    memberships = GroupMembershipSerializer(
        source='groupmembership_set', many=True, read_only=True
    )
    shared_with = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyGroup
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'is_public',
            'companies_count', 'owner', 'owner_name', 'owner_email',
            'memberships', 'shared_with', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'companies_count', 'owner', 'owner_name', 'owner_email',
            'shared_with', 'created_at', 'updated_at'
        ]
    
    def get_shared_with(self, obj):
        """Get list of users this group is shared with."""
        shares = obj.shares.select_related('shared_with')
        return [
            {
                'user_id': share.shared_with.id,
                'user_name': share.shared_with.name,
                'user_email': share.shared_with.email,
                'permission': share.permission,
                'shared_at': share.shared_at
            }
            for share in shares
        ]


class CompanyGroupCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating company groups."""
    
    class Meta:
        model = CompanyGroup
        fields = ['id', 'name', 'description', 'icon', 'color', 'is_public']
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
                _('You already have a group with this name.')
            )
        
        return value
    
    def validate_color(self, value):
        """Validate color is a valid hex code."""
        if value and not value.startswith('#'):
            value = f'#{value}'
        
        if value and len(value) not in [4, 7]:  # #RGB or #RRGGBB
            raise serializers.ValidationError(
                _('Color must be a valid hex code (e.g., #FF5733)')
            )
        
        return value
    
    def create(self, validated_data):
        """Create a new group for the current user."""
        user = self.context['request'].user
        return CompanyGroup.objects.create(owner=user, **validated_data)


class AddCompaniesToGroupSerializer(serializers.Serializer):
    """Serializer for adding companies to a group."""
    
    company_ids = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        allow_empty=False,
        help_text=_('List of company IDs to add to the group')
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text=_('Notes about why these companies were added')
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
        notes = validated_data.get('notes', '')
        
        memberships = []
        for company_id in company_ids:
            company = Company.objects.get(id=company_id)
            membership, created = GroupMembership.objects.get_or_create(
                group=group,
                company=company,
                defaults={
                    'added_by': user,
                    'notes': notes
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


class SharedGroupSerializer(serializers.ModelSerializer):
    """Serializer for sharing groups with users."""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    shared_with_name = serializers.CharField(source='shared_with.name', read_only=True)
    shared_with_email = serializers.CharField(source='shared_with.email', read_only=True)
    shared_by_name = serializers.CharField(source='shared_by.name', read_only=True)
    
    class Meta:
        model = SharedGroup
        fields = [
            'id', 'group', 'group_name', 'shared_with', 'shared_with_name',
            'shared_with_email', 'shared_by', 'shared_by_name', 'permission',
            'notify_changes', 'shared_at'
        ]
        read_only_fields = [
            'id', 'group_name', 'shared_with_name', 'shared_with_email',
            'shared_by', 'shared_by_name', 'shared_at'
        ]


class ShareGroupSerializer(serializers.Serializer):
    """Serializer for sharing a group with users."""
    
    user_emails = serializers.ListField(
        child=serializers.EmailField(),
        required=True,
        allow_empty=False,
        help_text=_('List of user emails to share the group with')
    )
    permission = serializers.ChoiceField(
        choices=SharedGroup.PERMISSION_CHOICES,
        default='view',
        help_text=_('Permission level for shared users')
    )
    notify_changes = serializers.BooleanField(
        default=True,
        help_text=_('Notify users when the group is modified')
    )
    
    def validate_user_emails(self, value):
        """Validate all emails belong to existing users."""
        invalid_emails = []
        for email in value:
            if not User.objects.filter(email=email.lower()).exists():
                invalid_emails.append(email)
        
        if invalid_emails:
            raise serializers.ValidationError(
                _('The following users do not exist: %(emails)s') % {
                    'emails': ', '.join(invalid_emails)
                }
            )
        
        return [email.lower() for email in value]
    
    def create(self, validated_data):
        """Share the group with specified users."""
        group = self.context['group']
        shared_by = self.context['request'].user
        user_emails = validated_data['user_emails']
        permission = validated_data['permission']
        notify_changes = validated_data['notify_changes']
        
        shares = []
        for email in user_emails:
            user = User.objects.get(email=email)
            
            # Skip if sharing with owner
            if user == group.owner:
                continue
            
            share, created = SharedGroup.objects.update_or_create(
                group=group,
                shared_with=user,
                defaults={
                    'shared_by': shared_by,
                    'permission': permission,
                    'notify_changes': notify_changes
                }
            )
            shares.append(share)
        
        return {'shared_count': len(shares), 'shares': shares}


class GroupStatisticsSerializer(serializers.Serializer):
    """Serializer for group statistics."""
    
    total_groups = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    shared_groups = serializers.IntegerField()
    public_groups = serializers.IntegerField()
    groups_by_icon = serializers.DictField()
    average_group_size = serializers.FloatField()