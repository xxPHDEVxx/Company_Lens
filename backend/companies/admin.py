"""
Company admin configuration for Company Lens.
"""

from django.contrib import admin
from .models import Company, Establishment, FinancialData, CompanyFollower


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'vat', 'status', 'region', 'city', 'employees', 'created_at']
    list_filter = ['status', 'region', 'legal_form', 'company_size']
    search_fields = ['name', 'vat', 'city', 'sector']
    readonly_fields = ['created_at', 'updated_at', 'last_update']
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
            'fields': ('nace_codes', 'activity', 'sector', 'company_type', 
                      'company_size', 'company_description')
        }),
        ('Location', {
            'fields': ('region', 'city', 'street', 'street_number', 
                      'postal_code', 'country')
        }),
        ('Contact', {
            'fields': ('website', 'phone', 'email')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Establishment)
class EstablishmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'unit_number', 'city', 'status']
    list_filter = ['status']
    search_fields = ['name', 'company__name', 'city', 'unit_number']
    raw_id_fields = ['company']


@admin.register(FinancialData)
class FinancialDataAdmin(admin.ModelAdmin):
    list_display = ['company', 'year', 'revenue', 'profit', 'margin', 'employees']
    list_filter = ['year']
    search_fields = ['company__name', 'company__vat']
    raw_id_fields = ['company']
    ordering = ['-year', 'company']


@admin.register(CompanyFollower)
class CompanyFollowerAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'followed_since', 'notify_updates']
    list_filter = ['notify_updates', 'followed_since']
    search_fields = ['user__email', 'company__name']
    raw_id_fields = ['user', 'company']
    readonly_fields = ['followed_since']