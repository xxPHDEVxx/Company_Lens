"""
Company admin configuration for Company Lens.
"""

from django.contrib import admin
from .models import Company, Establishment, FinancialData, CompanyFollower, Activity, Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['full_address', 'city', 'region', 'postal_code', 'created_at']
    list_filter = ['region', 'country']
    search_fields = ['street', 'city', 'postal_code']
    fieldsets = (
        ('Street Information', {
            'fields': ('street', 'street_number', 'postal_box')
        }),
        ('Location', {
            'fields': ('postal_code', 'city', 'province', 'region', 'country')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


class ActivityInline(admin.StackedInline):
    """Inline admin for Activity model."""
    model = Activity
    extra = 0
    fields = ['nacebel_codes', 'company_activities', 'sectors', 'services', 'description']
    verbose_name = "Company Activities"
    verbose_name_plural = "Company Activities"


class FinancialDataInline(admin.TabularInline):
    """Inline admin for Financial Data."""
    model = FinancialData
    extra = 0
    fields = ['year', 'revenue', 'profit', 'margin', 'employees']
    ordering = ['-year']


class EstablishmentInline(admin.TabularInline):
    """Inline admin for Establishments."""
    model = Establishment
    extra = 0
    fields = ['unit_number', 'name', 'get_city', 'status']
    readonly_fields = ['get_city']
    
    def get_city(self, obj):
        return obj.city or '-'
    get_city.short_description = 'City'


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'vat', 'status', 'get_region', 'get_city', 'employees', 'created_at']
    list_filter = ['status', 'legal_form', 'company_size', 'address__region']
    search_fields = ['name', 'vat', 'address__city']
    readonly_fields = ['created_at', 'updated_at', 'last_update', 'full_address', 'is_active']
    inlines = [ActivityInline, FinancialDataInline, EstablishmentInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'vat', 'name', 'status', 'legal_form')
        }),
        ('Dates', {
            'fields': ('creation_date', 'fiscal_year', 'last_update')
        }),
        ('Financial', {
            'fields': ('capital', 'employees')
        }),
        ('Classification', {
            'fields': ('company_type', 'company_size')
        }),
        ('Address', {
            'fields': ('address', 'full_address')
        }),
        ('Contact', {
            'fields': ('website', 'phone', 'email')
        }),
        ('Status', {
            'fields': ('is_active',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_region(self, obj):
        """Display region from address."""
        return obj.region or '-'
    get_region.short_description = 'Region'
    get_region.admin_order_field = 'address__region'
    
    def get_city(self, obj):
        """Display city from address."""
        return obj.city or '-'
    get_city.short_description = 'City'
    get_city.admin_order_field = 'address__city'


@admin.register(Establishment)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'unit_number', 'get_city', 'status']
    list_filter = ['status', 'address__region']
    search_fields = ['name', 'company__name', 'address__city', 'unit_number']
    raw_id_fields = ['company', 'address']
    
    def get_city(self, obj):
        return obj.city or '-'
    get_city.short_description = 'City'
    get_city.admin_order_field = 'address__city'


@admin.register(FinancialData)
class FinancialDataAdmin(admin.ModelAdmin):
    list_display = ['company', 'year', 'revenue', 'profit', 'margin', 'employees']
    list_filter = ['year']
    search_fields = ['company__name', 'company__vat']
    raw_id_fields = ['company']
    ordering = ['-year', 'company']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['company', 'get_primary_sector', 'get_primary_nacebel', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['company__name', 'company__vat', 'description']
    raw_id_fields = ['company']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_primary_sector(self, obj):
        return obj.primary_sector or '-'
    get_primary_sector.short_description = 'Primary Sector'
    
    def get_primary_nacebel(self, obj):
        return obj.primary_nacebel or '-'
    get_primary_nacebel.short_description = 'Primary NACEBEL'


@admin.register(CompanyFollower)
class CompanyFollowerAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'followed_since', 'notify_updates']
    list_filter = ['notify_updates', 'followed_since']
    search_fields = ['user__email', 'company__name']
    raw_id_fields = ['user', 'company']
    readonly_fields = ['followed_since']