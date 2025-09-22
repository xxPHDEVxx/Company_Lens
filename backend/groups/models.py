"""
Group models for Company Lens.
Models for organizing companies into custom groups.
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()


class CompanyGroup(models.Model):
    """Model for organizing companies into custom groups."""
    
    ICON_CHOICES = [
        ('competitive', 'Concurrence'),
        ('partnership', 'Partenariat'),
        ('supplier', 'Fournisseur'),
        ('client', 'Client'),
        ('finance', 'Finance'),
        ('technology', 'Technologie'),
        ('manufacturing', 'Production'),
        ('services', 'Services'),
        ('folder', 'Dossier'),
    ]
    
    # Ownership
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='company_groups',
        verbose_name=_('owner')
    )
    
    # Basic information
    name = models.CharField(_('group name'), max_length=100)
    description = models.TextField(_('description'), blank=True)
    icon = models.CharField(
        _('icon'),
        max_length=20,
        choices=ICON_CHOICES,
        default='folder',
        blank=True
    )
    
    # Position for ordering
    position = models.IntegerField(
        _('position'),
        default=0,
        help_text=_('Position for custom ordering')
    )
    
    # Companies in the group
    companies = models.ManyToManyField(
        Company,
        through='GroupMembership',
        related_name='groups',
        verbose_name=_('companies'),
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('company group')
        verbose_name_plural = _('company groups')
        db_table = 'company_groups'
        ordering = ['owner', 'position', 'name']
        unique_together = [['owner', 'name']]
    
    def __str__(self):
        return f"{self.name} ({self.owner.email})"
    
    @property
    def companies_count(self):
        """Get the number of companies in this group."""
        return self.companies.count()
    
    def add_companies(self, company_ids):
        """Add multiple companies to the group."""
        # Get the highest position in the group
        max_position = self.groupmembership_set.aggregate(
            max_pos=models.Max('position')
        )['max_pos'] or -1
        
        for i, company_id in enumerate(company_ids):
            try:
                company = Company.objects.get(id=company_id)
                GroupMembership.objects.get_or_create(
                    group=self,
                    company=company,
                    defaults={'position': max_position + i + 1}
                )
            except Company.DoesNotExist:
                continue
    
    def remove_company(self, company_id):
        """Remove a company from the group."""
        GroupMembership.objects.filter(
            group=self,
            company_id=company_id
        ).delete()


class GroupMembership(models.Model):
    """Through model for Company-Group relationship with additional metadata."""
    
    group = models.ForeignKey(
        CompanyGroup,
        on_delete=models.CASCADE,
        verbose_name=_('group')
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        verbose_name=_('company')
    )
    
    # Position for ordering
    position = models.IntegerField(
        _('position'),
        default=0,
        help_text=_('Position in the group for custom ordering')
    )
    
    # Metadata
    added_at = models.DateTimeField(_('added at'), auto_now_add=True)
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='group_additions',
        verbose_name=_('added by')
    )
    
    class Meta:
        verbose_name = _('group membership')
        verbose_name_plural = _('group memberships')
        db_table = 'group_memberships'
        unique_together = [['group', 'company']]
        ordering = ['group', 'position', 'added_at']
    
    def __str__(self):
        return f"{self.company.name} in {self.group.name}"


# SharedGroup model removed - groups are private to their creators