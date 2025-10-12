"""
Company views for Company Lens API.
Handles CRUD operations for companies, establishments, and financial data.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Sum, Avg
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
import logging

from .models import Company, Establishment, FinancialData, CompanyFollower
from .serializers import (
    CompanyListSerializer,
    CompanyDetailSerializer,
    CompanyCreateUpdateSerializer,
    EstablishmentSerializer,
    FinancialDataSerializer,
    CompanyFollowerSerializer,
    CompanyStatisticsSerializer,
    FollowedCompanySerializer
)
try:
    from .tasks import fetch_company_data_async
except ImportError:
    # Celery tasks not available
    fetch_company_data_async = None

logger = logging.getLogger(__name__)


class CompanyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Company model.
    Provides list, create, retrieve, update, partial_update, destroy actions.
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'vat', 'city', 'sector', 'activity']
    ordering_fields = ['name', 'creation_date', 'employees', 'updated_at']
    ordering = ['name']
    
    def get_queryset(self):
        """Get companies with optional filtering."""
        queryset = Company.objects.all()
        
        # Filter by region
        region = self.request.query_params.get('region')
        if region:
            queryset = queryset.filter(region=region)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by company size
        size = self.request.query_params.get('size')
        if size:
            queryset = queryset.filter(company_size=size)
        
        # Filter by sector
        sector = self.request.query_params.get('sector')
        if sector:
            queryset = queryset.filter(sector__icontains=sector)
        
        # Filter by NACE code
        nace = self.request.query_params.get('nace')
        if nace:
            queryset = queryset.filter(nace_codes__contains=nace)
        
        # Filter by employee range
        min_employees = self.request.query_params.get('min_employees')
        if min_employees:
            queryset = queryset.filter(employees__gte=min_employees)
        
        max_employees = self.request.query_params.get('max_employees')
        if max_employees:
            queryset = queryset.filter(employees__lte=max_employees)
        
        # Prefetch related data for performance
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'establishments',
                'financial_data',
                'followers'
            )
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action == 'retrieve':
            return CompanyDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateUpdateSerializer
        elif self.action == 'statistics':
            return CompanyStatisticsSerializer
        return CompanyDetailSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def search(self, request):
        """
        Advanced company search with multiple criteria.
        If a company is not found by VAT, triggers an async fetch from AI scraper.
        """
        queryset = Company.objects.all()
        params = request.query_params
        
        # Initialize search variables
        query = ''
        search_type = 'name'
        vat_search = False
        clean_vat = None
        
        # Check for direct VAT number search (from frontend)
        vat_number = params.get('vatNumber', '').strip()
        if vat_number:
            # Clean VAT number for search
            clean_vat = vat_number.upper().replace(' ', '').replace('.', '')
            # Ensure proper Belgian VAT format
            if not clean_vat.startswith('BE'):
                clean_vat = 'BE' + clean_vat.lstrip('0')
            # Pad with zeros if needed (Belgian VAT should be BE + 10 digits)
            if clean_vat.startswith('BE') and len(clean_vat) < 12:
                clean_vat = 'BE' + clean_vat[2:].zfill(10)
            
            queryset = queryset.filter(vat__icontains=clean_vat)
            search_type = 'vat'  # Set search type for ordering logic
            vat_search = True
        else:
            # Apply search based on type (legacy/alternative format)
            query = params.get('query', '').strip()
            search_type = params.get('search_type', 'name')
            
            if query:
                if search_type == 'vat':
                    # Clean VAT number for search
                    clean_vat = query.upper().replace(' ', '').replace('.', '')
                    if not clean_vat.startswith('BE'):
                        clean_vat = 'BE' + clean_vat.lstrip('0')
                    if clean_vat.startswith('BE') and len(clean_vat) < 12:
                        clean_vat = 'BE' + clean_vat[2:].zfill(10)
                    
                    queryset = queryset.filter(vat__icontains=clean_vat)
                    vat_search = True
                elif search_type == 'name':
                    queryset = queryset.filter(name__icontains=query)
                elif search_type == 'city':
                    queryset = queryset.filter(city__icontains=query)
                elif search_type == 'sector':
                    queryset = queryset.filter(sector__icontains=query)
                elif search_type == 'nace':
                    queryset = queryset.filter(nace_codes__contains=query)
        
        # Apply additional filters
        if params.get('region'):
            queryset = queryset.filter(region=params['region'])
        
        if params.get('status'):
            queryset = queryset.filter(status=params['status'])
        
        if params.get('company_size'):
            queryset = queryset.filter(company_size=params['company_size'])
        
        if params.get('min_employees'):
            try:
                queryset = queryset.filter(employees__gte=int(params['min_employees']))
            except (ValueError, TypeError):
                pass
        
        if params.get('max_employees'):
            try:
                queryset = queryset.filter(employees__lte=int(params['max_employees']))
            except (ValueError, TypeError):
                pass
        
        # Check if this is a VAT search with no results - trigger async fetch
        if vat_search and clean_vat and queryset.count() == 0:
            # Check if we're already fetching this VAT
            fetch_status_key = f"fetch_status:{clean_vat}"
            fetch_status = cache.get(fetch_status_key)
            
            if fetch_status and fetch_status.get('status') == 'pending':
                # Already fetching this VAT
                return Response({
                    'results': [],
                    'count': 0,
                    'fetch_status': 'pending',
                    'message': _('Company data is being fetched. Please check back in a moment.'),
                    'task_id': fetch_status.get('task_id')
                }, status=status.HTTP_202_ACCEPTED)
            
            # Check if we recently failed to fetch this VAT
            failed_key = f"company_fetch_failed:{clean_vat}"
            failed_data = cache.get(failed_key)
            if failed_data:
                return Response({
                    'results': [],
                    'count': 0,
                    'fetch_status': 'failed',
                    'message': _('Unable to fetch company data at this time.'),
                    'error': failed_data.get('error', 'Unknown error')
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Trigger async fetch with Celery
            try:
                if fetch_company_data_async is None:
                    logger.error("Celery tasks not available")
                    return Response({
                        'results': [],
                        'count': 0,
                        'fetch_status': 'error',
                        'message': _('Background task system not available'),
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                # Launch task asynchronously (returns immediately)
                task = fetch_company_data_async.delay(clean_vat, user_id=request.user.id)

                # Store fetch status in cache
                cache.set(fetch_status_key, {
                    'status': 'pending',
                    'task_id': task.id,
                    'vat': clean_vat,
                    'timestamp': timezone.now().isoformat()
                }, timeout=300)  # 5 minutes

                logger.info(f"Triggered async fetch for VAT {clean_vat}, task_id: {task.id}")

                return Response({
                    'results': [],
                    'count': 0,
                    'fetch_status': 'pending',
                    'message': _('Company not found in database. Fetching from external sources...'),
                    'task_id': task.id,
                    'vat': clean_vat
                }, status=status.HTTP_202_ACCEPTED)

            except Exception as e:
                logger.error(f"Failed to trigger fetch for VAT {clean_vat}: {e}")
                return Response({
                    'results': [],
                    'count': 0,
                    'fetch_status': 'error',
                    'message': _('Unable to fetch company data at this time.'),
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Order by relevance or name
        if query and search_type == 'name':
            # Put exact matches first
            queryset = queryset.extra(
                select={'exact_match': "name = %s"},
                select_params=(query,),
                order_by=['-exact_match', 'name']
            )
        else:
            queryset = queryset.order_by('name')
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CompanyListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = CompanyListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def fetch_status(self, request):
        """
        Check the status of a company fetch task.
        """
        task_id = request.query_params.get('task_id')
        vat_number = request.query_params.get('vat')
        
        if not task_id and not vat_number:
            return Response({
                'error': _('Either task_id or vat parameter is required')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check by VAT number first
        if vat_number:
            # Clean VAT number
            clean_vat = vat_number.upper().replace(' ', '').replace('.', '')
            if not clean_vat.startswith('BE'):
                clean_vat = 'BE' + clean_vat.lstrip('0')
            if clean_vat.startswith('BE') and len(clean_vat) < 12:
                clean_vat = 'BE' + clean_vat[2:].zfill(10)
            
            # Check if company now exists
            try:
                company = Company.objects.get(vat=clean_vat)
                serializer = CompanyDetailSerializer(company, context={'request': request})
                return Response({
                    'status': 'completed',
                    'data': serializer.data,
                    'message': _('Company data fetched successfully')
                })
            except Company.DoesNotExist:
                pass
            
            # Check fetch status in cache
            fetch_status_key = f"fetch_status:{clean_vat}"
            fetch_status = cache.get(fetch_status_key)
            
            if fetch_status:
                return Response(fetch_status)
            
            # Check if we have a failure record
            failed_key = f"company_fetch_failed:{clean_vat}"
            failed_data = cache.get(failed_key)
            if failed_data:
                return Response({
                    'status': 'failed',
                    'error': failed_data.get('error', 'Unknown error'),
                    'message': _('Failed to fetch company data')
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Check by task ID using Celery result backend
        if task_id:
            try:
                from celery.result import AsyncResult
            except ImportError:
                return Response(
                    {'error': 'Task tracking not available'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            result = AsyncResult(task_id)
            
            if result.ready():
                if result.successful():
                    task_result = result.get()
                    if task_result.get('status') == 'success':
                        return Response({
                            'status': 'completed',
                            'data': task_result.get('data'),
                            'message': _('Company data fetched successfully')
                        })
                    else:
                        return Response({
                            'status': 'failed',
                            'error': task_result.get('error', 'Unknown error'),
                            'message': _('Failed to fetch company data')
                        }, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({
                        'status': 'failed',
                        'error': str(result.info),
                        'message': _('Task failed')
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    'status': 'pending',
                    'message': _('Task is still processing'),
                    'task_id': task_id
                })
        
        return Response({
            'status': 'unknown',
            'message': _('No information available for this request')
        }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        """
        Follow a company to receive updates.
        """
        company = self.get_object()
        
        # Check if already following
        if CompanyFollower.objects.filter(user=request.user, company=company).exists():
            return Response(
                {'message': _('You are already following this company.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create follower relationship
        follower = CompanyFollower.objects.create(
            user=request.user,
            company=company,
            notify_updates=request.data.get('notify_updates', True)
        )
        
        serializer = CompanyFollowerSerializer(follower)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unfollow(self, request, pk=None):
        """
        Unfollow a company.
        """
        company = self.get_object()
        
        try:
            follower = CompanyFollower.objects.get(user=request.user, company=company)
            follower.delete()
            return Response(
                {'message': _('Successfully unfollowed the company.')},
                status=status.HTTP_200_OK
            )
        except CompanyFollower.DoesNotExist:
            return Response(
                {'message': _('You are not following this company.')},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def establishments(self, request, pk=None):
        """
        Get all establishments for a company.
        """
        company = self.get_object()
        establishments = company.establishments.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            establishments = establishments.filter(status=status_filter)
        
        serializer = EstablishmentSerializer(establishments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def financials(self, request, pk=None):
        """
        Get financial history for a company.
        """
        company = self.get_object()
        financials = company.financial_data.all().order_by('-year')
        
        # Filter by year range if provided
        start_year = request.query_params.get('start_year')
        end_year = request.query_params.get('end_year')
        
        if start_year:
            financials = financials.filter(year__gte=start_year)
        if end_year:
            financials = financials.filter(year__lte=end_year)
        
        serializer = FinancialDataSerializer(financials, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def statistics(self, request):
        """
        Get general statistics about companies in the database.
        """
        # Calculate statistics
        total_companies = Company.objects.count()
        active_companies = Company.objects.filter(status='active').count()
        total_employees = Company.objects.filter(
            employees__isnull=False
        ).aggregate(Sum('employees'))['employees__sum'] or 0
        
        # Group by region
        by_region = dict(
            Company.objects.values('region').annotate(
                count=Count('id')
            ).values_list('region', 'count')
        )
        
        # Group by size
        by_size = dict(
            Company.objects.values('company_size').annotate(
                count=Count('id')
            ).values_list('company_size', 'count')
        )
        
        # Group by sector (top 10)
        by_sector = dict(
            Company.objects.exclude(sector='').values('sector').annotate(
                count=Count('id')
            ).order_by('-count')[:10].values_list('sector', 'count')
        )
        
        # Recent updates (last 30 days)
        recent_date = timezone.now() - timedelta(days=30)
        recent_updates = Company.objects.filter(
            updated_at__gte=recent_date
        ).count()
        
        data = {
            'total_companies': total_companies,
            'active_companies': active_companies,
            'total_employees': total_employees,
            'by_region': by_region,
            'by_size': by_size,
            'by_sector': by_sector,
            'recent_updates': recent_updates
        }
        
        serializer = CompanyStatisticsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def followed(self, request):
        """
        Get companies followed by the current user with follow metadata.
        """
        followed = CompanyFollower.objects.filter(
            user=request.user
        ).select_related('company').order_by('-followed_since')
        
        serializer = FollowedCompanySerializer(
            followed,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def recent(self, request):
        """
        Get recently updated companies.
        """
        days = int(request.query_params.get('days', 7))
        recent_date = timezone.now() - timedelta(days=days)
        
        companies = Company.objects.filter(
            updated_at__gte=recent_date
        ).order_by('-updated_at')[:50]
        
        serializer = CompanyListSerializer(
            companies,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)


class EstablishmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Establishment model.
    """
    
    queryset = Establishment.objects.all()
    serializer_class = EstablishmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'unit_number', 'city']
    ordering_fields = ['name', 'creation_date']
    ordering = ['name']
    
    def get_queryset(self):
        """Filter establishments based on query parameters."""
        queryset = super().get_queryset()
        
        # Filter by company
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        # Filter by type
        est_type = self.request.query_params.get('type')
        if est_type:
            queryset = queryset.filter(type=est_type)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        return queryset.select_related('company')


class FinancialDataViewSet(viewsets.ModelViewSet):
    """
    ViewSet for FinancialData model.
    """
    
    queryset = FinancialData.objects.all()
    serializer_class = FinancialDataSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['year', 'revenue', 'profit']
    ordering = ['-year']
    
    def get_queryset(self):
        """Filter financial data based on query parameters."""
        queryset = super().get_queryset()
        
        # Filter by company
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        
        # Filter by year range
        start_year = self.request.query_params.get('start_year')
        end_year = self.request.query_params.get('end_year')
        
        if start_year:
            queryset = queryset.filter(year__gte=start_year)
        if end_year:
            queryset = queryset.filter(year__lte=end_year)
        
        # Filter by minimum revenue
        min_revenue = self.request.query_params.get('min_revenue')
        if min_revenue:
            queryset = queryset.filter(revenue__gte=min_revenue)
        
        return queryset.select_related('company')
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        """
        Get financial trends for a company or sector.
        """
        company_id = request.query_params.get('company_id')
        sector = request.query_params.get('sector')
        years = int(request.query_params.get('years', 5))
        
        current_year = timezone.now().year
        start_year = current_year - years
        
        if company_id:
            # Get trends for specific company
            data = FinancialData.objects.filter(
                company_id=company_id,
                year__gte=start_year
            ).order_by('year').values('year', 'revenue', 'profit', 'employees')
        elif sector:
            # Get average trends for sector
            data = FinancialData.objects.filter(
                company__sector=sector,
                year__gte=start_year
            ).values('year').annotate(
                revenue=Avg('revenue'),
                profit=Avg('profit'),
                employees=Avg('employees')
            ).order_by('year')
        else:
            return Response(
                {'message': _('Please provide company_id or sector parameter.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(list(data))
