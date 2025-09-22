from django.contrib import admin
from .models import RecentSearch


@admin.register(RecentSearch)
class RecentSearchAdmin(admin.ModelAdmin):
    list_display = ['name', 'vat', 'user', 'searched_at', 'click_count']
    list_filter = ['searched_at', 'user']
    search_fields = ['name', 'vat', 'user__email']
    readonly_fields = ['searched_at', 'color', 'time']
    ordering = ['-searched_at']
    date_hierarchy = 'searched_at'
