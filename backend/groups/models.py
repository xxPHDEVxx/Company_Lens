"""
Group models for Company Lens.
Models for organizing companies into custom groups.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()


class CompanyGroup(models.Model):
    """Model for organizing companies into custom groups."""
    
    ICON_CHOICES = [
        ('folder', 'Folder'),
        ('star', 'Star'),
        ('tag', 'Tag'),
        ('bookmark', 'Bookmark'),
        ('briefcase', 'Briefcase'),
        ('building', 'Building'),
        ('chart', 'Chart'),
        ('users', 'Users'),
        ('globe', 'Globe'),
        ('flag', 'Flag'),
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
    
    # Settings
    is_public = models.BooleanField(
        _('public'),
        default=False,
        help_text=_('Whether this group is visible to other users')
    )
    color = models.CharField(
        _('color'),
        max_length=7,
        blank=True,
        help_text=_('Hex color code for the group (e.g., #FF5733)')
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
        ordering = ['owner', 'name']
        unique_together = [['owner', 'name']]
    
    def __str__(self):
        return f"{self.name} ({self.owner.email})"
    
    @property
    def companies_count(self):
        """Get the number of companies in this group."""
        return self.companies.count()
    
    def add_companies(self, company_ids):
        """Add multiple companies to the group."""
        for company_id in company_ids:
            try:
                company = Company.objects.get(id=company_id)
                GroupMembership.objects.get_or_create(
                    group=self,
                    company=company
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
    notes = models.TextField(
        _('notes'),
        blank=True,
        help_text=_('Notes about why this company was added to the group')
    )
    
    # Custom ordering within the group
    position = models.IntegerField(
        _('position'),
        default=0,
        help_text=_('Custom ordering position within the group')
    )
    
    class Meta:
        verbose_name = _('group membership')
        verbose_name_plural = _('group memberships')
        db_table = 'group_memberships'
        unique_together = [['group', 'company']]
        ordering = ['group', 'position', 'added_at']
    
    def __str__(self):
        return f"{self.company.name} in {self.group.name}"


class SharedGroup(models.Model):
    """Model for sharing groups with other users."""
    
    PERMISSION_CHOICES = [
        ('view', _('View Only')),
        ('edit', _('Can Edit')),
        ('admin', _('Admin')),
    ]
    
    group = models.ForeignKey(
        CompanyGroup,
        on_delete=models.CASCADE,
        related_name='shares',
        verbose_name=_('group')
    )
    shared_with = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='shared_groups',
        verbose_name=_('shared with')
    )
    shared_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='groups_shared',
        verbose_name=_('shared by')
    )
    
    permission = models.CharField(
        _('permission'),
        max_length=10,
        choices=PERMISSION_CHOICES,
        default='view'
    )
    
    # Timestamps
    shared_at = models.DateTimeField(_('shared at'), auto_now_add=True)
    
    # Notification settings
    notify_changes = models.BooleanField(
        _('notify on changes'),
        default=True,
        help_text=_('Receive notifications when the group is modified')
    )
    
    class Meta:
        verbose_name = _('shared group')
        verbose_name_plural = _('shared groups')
        db_table = 'shared_groups'
        unique_together = [['group', 'shared_with']]
        ordering = ['-shared_at']
    
    def __str__(self):
        return f"{self.group.name} shared with {self.shared_with.email}"