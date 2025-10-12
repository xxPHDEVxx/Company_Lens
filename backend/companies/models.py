"""
Company models for Company Lens.
Models for Belgian companies, their establishments, and financial data.
"""

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator

User = get_user_model()


class Address(models.Model):
    """Address model for companies and establishments."""
    
    # Address fields
    street = models.CharField(_('street'), max_length=255, blank=True)
    street_number = models.CharField(_('street number'), max_length=20, blank=True)
    postal_box = models.CharField(_('postal box'), max_length=50, blank=True, help_text=_('e.g., Box 12, Boite 5'))
    postal_code = models.CharField(_('postal code'), max_length=10, blank=True)
    city = models.CharField(_('city'), max_length=100, blank=True)
    province = models.CharField(_('province'), max_length=100, blank=True)
    region = models.CharField(
        _('region'), 
        max_length=20, 
        choices=[
            ('flanders', _('Flanders')),
            ('wallonia', _('Wallonia')),
            ('brussels', _('Brussels')),
        ], 
        blank=True
    )
    country = models.CharField(_('country'), max_length=2, default='BE')
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('address')
        verbose_name_plural = _('addresses')
        db_table = 'addresses'
    
    def __str__(self):
        return self.full_address
    
    @property
    def full_address(self):
        """Return the full formatted address."""
        parts = []
        if self.street and self.street_number:
            parts.append(f"{self.street} {self.street_number}")
        if self.postal_box:
            parts.append(self.postal_box)
        if self.postal_code and self.city:
            parts.append(f"{self.postal_code} {self.city}")
        if self.province:
            parts.append(self.province)
        if self.country:
            parts.append(self.country)
        return ', '.join(filter(None, parts)) or 'No address'


class Company(models.Model):
    """Main company model representing Belgian companies."""
    
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('dissolved', _('Dissolved')),
        ('bankrupt', _('Bankrupt')),
    ]
    
    LEGAL_FORM_CHOICES = [
        ('SA', _('SA - Société Anonyme')),
        ('SRL', _('SRL - Société à Responsabilité Limitée')),
        ('SPRL', _('SPRL - Société Privée à Responsabilité Limitée')),
        ('SC', _('SC - Société Coopérative')),
        ('SNC', _('SNC - Société en Nom Collectif')),
        ('SCS', _('SCS - Société en Commandite Simple')),
        ('ASBL', _('ASBL - Association Sans But Lucratif')),
        ('AISBL', _('AISBL - Association Internationale Sans But Lucratif')),
        ('OTHER', _('Other')),
    ]
    
    REGION_CHOICES = [
        ('flanders', _('Flanders')),
        ('wallonia', _('Wallonia')),
        ('brussels', _('Brussels')),
    ]
    
    COMPANY_SIZE_CHOICES = [
        ('micro', _('Micro (1-9 employees)')),
        ('small', _('Small (10-49 employees)')),
        ('medium', _('Medium (50-249 employees)')),
        ('large', _('Large (250+ employees)')),
    ]
    
    # Primary identification
    id = models.CharField(
        _('company ID'),
        max_length=50,
        primary_key=True,
        help_text=_('Unique identifier for the company')
    )
    vat = models.CharField(
        _('VAT number'),
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^BE\d{10}$',
                message=_('VAT number must be in format BE0123456789'),
            ),
        ],
        help_text=_('Belgian VAT number (BE + 10 digits)')
    )
    
    # Basic information
    name = models.CharField(_('company name'), max_length=255, db_index=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True
    )
    legal_form = models.CharField(
        _('legal form'),
        max_length=20,
        choices=LEGAL_FORM_CHOICES,
        blank=True
    )
    
    # Dates
    creation_date = models.DateField(_('creation date'), blank=True, null=True)
    fiscal_year = models.CharField(
        _('fiscal year'),
        max_length=20,
        blank=True,
        help_text=_('Fiscal year end date (e.g., 31/12)')
    )
    last_update = models.DateTimeField(_('last update'), auto_now=True)
    
    # Financial information
    capital = models.CharField(_('capital'), max_length=50, blank=True)
    employees = models.IntegerField(_('number of employees'), blank=True, null=True)
    
    # Classification
    
    # Keep these in Company model as they relate to company classification
    company_type = models.CharField(_('company type'), max_length=50, blank=True)
    company_size = models.CharField(
        _('company size'),
        max_length=20,
        choices=COMPANY_SIZE_CHOICES,
        blank=True
    )
    
    # Address relation
    address = models.OneToOneField(
        Address,
        on_delete=models.CASCADE,
        related_name='company',
        null=True,
        blank=True,
        verbose_name=_('address')
    )
    
    # Contact information
    website = models.URLField(_('website'), blank=True, null=True)
    phone = models.CharField(_('phone'), max_length=20, blank=True, null=True)
    email = models.EmailField(_('email'), blank=True, null=True)
    
    # Tracking
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('company')
        verbose_name_plural = _('companies')
        db_table = 'companies'
        ordering = ['name']
        indexes = [
            models.Index(fields=['vat']),
            models.Index(fields=['status']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.vat})"
    
    @property
    def full_address(self):
        """Return the full formatted address."""
        if self.address:
            return self.address.full_address
        return 'No address'
    
    @property
    def city(self):
        """Get city from address."""
        return self.address.city if self.address else None
    
    @property
    def region(self):
        """Get region from address."""
        return self.address.region if self.address else None
    
    @property
    def is_active(self):
        """Check if company is currently active."""
        return self.status == 'active'


class Establishment(models.Model):
    """Establishment model representing company locations/branches."""
    
    STATUS_CHOICES = [
        ('active', _('Active')),
        ('inactive', _('Inactive')),
        ('closed', _('Closed')),
    ]
    
    # Relations
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='establishments',
        verbose_name=_('company')
    )
    
    # Identification
    unit_number = models.CharField(
        _('unit number'),
        max_length=50,
        help_text=_('KBO unit number')
    )
    name = models.CharField(_('establishment name'), max_length=255)
    
    # Address relation
    address = models.OneToOneField(
        Address,
        on_delete=models.CASCADE,
        related_name='establishment',
        null=True,
        blank=True,
        verbose_name=_('address')
    )
    
    # Details
    creation_date = models.DateField(_('creation date'), blank=True, null=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('establishment')
        verbose_name_plural = _('establishments')
        db_table = 'establishments'
        unique_together = [['company', 'unit_number']]
        ordering = ['company', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"
    
    @property
    def full_address(self):
        """Return the full formatted address."""
        return self.address.full_address if self.address else 'No address'
    
    @property
    def city(self):
        """Get city from address."""
        return self.address.city if self.address else None


class Activity(models.Model):
    """Activity model for company's business activities and sectors."""
    
    # Relations
    company = models.OneToOneField(
        Company,
        on_delete=models.CASCADE,
        related_name='activities',
        verbose_name=_('company')
    )
    
    # Activity fields
    nacebel_codes = models.JSONField(
        _('NACEBEL codes'),
        default=list,
        blank=True,
        help_text=_('List of NACEBEL activity codes')
    )
    company_activities = models.JSONField(
        _('company activities'),
        default=list,
        blank=True,
        help_text=_('List of company activities')
    )
    sectors = models.JSONField(
        _('sectors'),
        default=list,
        blank=True,
        help_text=_('List of business sectors')
    )
    services = models.JSONField(
        _('services'),
        default=list,
        blank=True,
        help_text=_('List of services offered')
    )
    
    # Additional description
    description = models.TextField(
        _('activity description'),
        blank=True,
        help_text=_('Detailed description of company activities')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('activity')
        verbose_name_plural = _('activities')
        db_table = 'company_activities'
    
    def __str__(self):
        return f"{self.company.name} - Activities"
    
    @property
    def primary_sector(self):
        """Return the primary sector if available."""
        return self.sectors[0] if self.sectors else None
    
    @property
    def primary_nacebel(self):
        """Return the primary NACEBEL code if available."""
        return self.nacebel_codes[0] if self.nacebel_codes else None


class FinancialData(models.Model):
    """Financial data model for company financial history."""
    
    # Relations
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='financial_data',
        verbose_name=_('company')
    )
    
    # Financial year
    year = models.IntegerField(_('year'))
    
    # Financial metrics (in EUR)
    revenue = models.DecimalField(
        _('revenue'),
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True
    )
    profit = models.DecimalField(
        _('profit'),
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True
    )
    margin = models.DecimalField(
        _('margin'),
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text=_('Profit margin as percentage')
    )
    
    # Other metrics
    employees = models.IntegerField(_('number of employees'), blank=True, null=True)
    
    # Additional financial data (flexible storage)
    extra_data = models.JSONField(
        _('additional data'),
        default=dict,
        blank=True,
        help_text=_('Additional financial metrics')
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('financial data')
        verbose_name_plural = _('financial data')
        db_table = 'financial_data'
        unique_together = [['company', 'year']]
        ordering = ['company', '-year']
    
    def __str__(self):
        return f"{self.company.name} - {self.year}"
    
    @property
    def revenue_growth(self):
        """Calculate revenue growth compared to previous year."""
        try:
            previous = FinancialData.objects.get(
                company=self.company,
                year=self.year - 1
            )
            if previous.revenue and self.revenue:
                return ((self.revenue - previous.revenue) / previous.revenue) * 100
        except FinancialData.DoesNotExist:
            pass
        return None


class CompanyFollower(models.Model):
    """Model to track users following companies."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followed_companies',
        verbose_name=_('user')
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name=_('company')
    )
    followed_since = models.DateTimeField(_('followed since'), auto_now_add=True)
    
    # Notification preferences
    notify_updates = models.BooleanField(
        _('notify on updates'),
        default=True,
        help_text=_('Receive notifications when company data is updated')
    )
    
    class Meta:
        verbose_name = _('company follower')
        verbose_name_plural = _('company followers')
        db_table = 'company_followers'
        unique_together = [['user', 'company']]
        ordering = ['-followed_since']
    
    def __str__(self):
        return f"{self.user.email} follows {self.company.name}"