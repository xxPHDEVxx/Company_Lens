"""
Admin configuration for Groups app.
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import CompanyGroup, GroupMembership


@admin.register(CompanyGroup)
class CompanyGroupAdmin(admin.ModelAdmin):
    """Admin interface for CompanyGroup model."""
    
    list_display = ('name', 'owner', 'companies_count', 'icon', 'created_at')
    list_filter = ('owner', 'icon', 'created_at')
    search_fields = ('name', 'description', 'owner__email', 'owner__name')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'owner')
        }),
        (_('Appearance'), {
            'fields': ('icon',),
            'classes': ('collapse',)
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'companies_count')
    
    def companies_count(self, obj):
        """Display the number of companies in the group."""
        return obj.companies.count()
    companies_count.short_description = _('Companies')
    companies_count.admin_order_field = 'companies__count'


@admin.register(GroupMembership)
class GroupMembershipAdmin(admin.ModelAdmin):
    """Admin interface for GroupMembership model."""
    
    list_display = ('group', 'company', 'added_by', 'added_at')
    list_filter = ('group', 'added_by', 'added_at')
    search_fields = (
        'group__name', 
        'company__name', 
        'company__vat',
        'added_by__email'
    )
    ordering = ('group', 'added_at')
    date_hierarchy = 'added_at'
    
    fieldsets = (
        (_('Relationship'), {
            'fields': ('group', 'company')
        }),
        (_('Metadata'), {
            'fields': ('added_by',)
        }),
        (_('Timestamps'), {
            'fields': ('added_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('added_at',)
    autocomplete_fields = ['group', 'company']


# SharedGroup admin removed - groups are private to their creators


# Inline admin for GroupMembership
class GroupMembershipInline(admin.TabularInline):
    """Inline admin for companies in a group."""
    model = GroupMembership
    extra = 0
    fields = ('company', 'added_by')
    readonly_fields = ('added_by', 'added_at')
    autocomplete_fields = ['company']


# Alternative admin with inline companies
class CompanyGroupWithMembersAdmin(CompanyGroupAdmin):
    """Extended admin for CompanyGroup with inline members."""
    inlines = [GroupMembershipInline]


# You can uncomment this to use the version with inline members instead
# admin.site.unregister(CompanyGroup)
# admin.site.register(CompanyGroup, CompanyGroupWithMembersAdmin)