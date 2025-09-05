"""
Search models for Company Lens.
Models for tracking user search history and search analytics.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
import random

User = get_user_model()


class RecentSearch(models.Model):
    """Model for tracking recent searches by users."""
    
    # Color choices for search items (for UI display)
    COLOR_CHOICES = [
        ('#FF6B6B', 'Red'),
        ('#4ECDC4', 'Teal'),
        ('#45B7D1', 'Blue'),
        ('#96CEB4', 'Green'),
        ('#FECA57', 'Yellow'),
        ('#FF9FF3', 'Pink'),
        ('#54A0FF', 'Light Blue'),
        ('#48DBFB', 'Sky Blue'),
        ('#FF6348', 'Orange'),
        ('#A29BFE', 'Purple'),
    ]
    
    # Relations
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='recent_searches',
        verbose_name=_('user')
    )
    
    # Search data
    name = models.CharField(
        _('company name'),
        max_length=255,
        help_text=_('Name of the company searched')
    )
    vat = models.CharField(
        _('VAT number'),
        max_length=20,
        help_text=_('VAT number of the company searched')
    )
    
    # UI elements
    color = models.CharField(
        _('color'),
        max_length=7,
        help_text=_('Hex color code for display')
    )
    
    # Search metadata
    search_query = models.CharField(
        _('search query'),
        max_length=255,
        blank=True,
        help_text=_('Original search query entered by user')
    )
    search_filters = models.JSONField(
        _('search filters'),
        default=dict,
        blank=True,
        help_text=_('Filters applied during search')
    )
    
    # Timestamps
    searched_at = models.DateTimeField(_('searched at'), auto_now_add=True)
    
    # Analytics
    click_count = models.IntegerField(
        _('click count'),
        default=1,
        help_text=_('Number of times this search result was clicked')
    )
    
    class Meta:
        verbose_name = _('recent search')
        verbose_name_plural = _('recent searches')
        db_table = 'recent_searches'
        ordering = ['-searched_at']
        indexes = [
            models.Index(fields=['user', '-searched_at']),
            models.Index(fields=['vat']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        """Override save to auto-assign color if not set."""
        if not self.color:
            self.color = random.choice([c[0] for c in self.COLOR_CHOICES])
        super().save(*args, **kwargs)
    
    @property
    def time(self):
        """Return the search timestamp in ISO format."""
        return self.searched_at.isoformat()


class SearchAnalytics(models.Model):
    """Model for tracking search analytics and patterns."""
    
    SEARCH_TYPE_CHOICES = [
        ('quick', _('Quick Search')),
        ('advanced', _('Advanced Search')),
        ('vat', _('VAT Number Search')),
        ('name', _('Company Name Search')),
        ('filter', _('Filtered Search')),
    ]
    
    # Relations
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='search_analytics',
        verbose_name=_('user')
    )
    
    # Search details
    search_type = models.CharField(
        _('search type'),
        max_length=20,
        choices=SEARCH_TYPE_CHOICES,
        default='quick'
    )
    query = models.TextField(_('search query'))
    filters = models.JSONField(
        _('applied filters'),
        default=dict,
        blank=True
    )
    
    # Results
    results_count = models.IntegerField(
        _('results count'),
        default=0,
        help_text=_('Number of results returned')
    )
    result_clicked = models.CharField(
        _('result clicked'),
        max_length=50,
        blank=True,
        help_text=_('ID of the result clicked by user')
    )
    
    # Performance metrics
    response_time = models.FloatField(
        _('response time'),
        blank=True,
        null=True,
        help_text=_('Search response time in seconds')
    )
    
    # Session tracking
    session_id = models.CharField(
        _('session ID'),
        max_length=100,
        blank=True,
        help_text=_('Session identifier for grouping searches')
    )
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        blank=True,
        null=True
    )
    user_agent = models.TextField(_('user agent'), blank=True)
    
    # Timestamp
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('search analytics')
        verbose_name_plural = _('search analytics')
        db_table = 'search_analytics'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['search_type', '-created_at']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        return f"{self.search_type} - {self.query[:50]}"


class SavedSearch(models.Model):
    """Model for saving search queries with filters for quick access."""
    
    # Relations
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_searches',
        verbose_name=_('user')
    )
    
    # Search details
    name = models.CharField(
        _('search name'),
        max_length=100,
        help_text=_('Custom name for this saved search')
    )
    description = models.TextField(_('description'), blank=True)
    
    # Search parameters
    query = models.CharField(_('search query'), max_length=255, blank=True)
    filters = models.JSONField(
        _('search filters'),
        default=dict,
        help_text=_('Saved filter parameters')
    )
    
    # Settings
    is_default = models.BooleanField(
        _('default search'),
        default=False,
        help_text=_('Use as default search when opening search page')
    )
    notify_new_results = models.BooleanField(
        _('notify new results'),
        default=False,
        help_text=_('Send notifications when new companies match this search')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    last_used = models.DateTimeField(_('last used'), blank=True, null=True)
    
    # Usage tracking
    use_count = models.IntegerField(_('use count'), default=0)
    
    class Meta:
        verbose_name = _('saved search')
        verbose_name_plural = _('saved searches')
        db_table = 'saved_searches'
        ordering = ['user', '-use_count', 'name']
        unique_together = [['user', 'name']]
    
    def __str__(self):
        return f"{self.name} - {self.user.email}"
    
    def mark_used(self):
        """Update last used timestamp and increment use count."""
        self.last_used = timezone.now()
        self.use_count += 1
        self.save(update_fields=['last_used', 'use_count'])