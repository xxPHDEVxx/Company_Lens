"""
Search models for Company Lens.
Models for tracking user search history.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()


class RecentSearch(models.Model):
    """Model for tracking recent searches by users."""
    
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
    company_id = models.CharField(
        _('company ID'),
        max_length=50,
        blank=True,
        help_text=_('ID of the company for navigation')
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
    
    @property
    def time(self):
        """Return the search timestamp in ISO format."""
        return self.searched_at.isoformat()
