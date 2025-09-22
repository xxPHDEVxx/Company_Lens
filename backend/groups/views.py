"""
Group views for Company Lens API.
Handles CRUD operations for company groups and sharing functionality.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils.translation import gettext_lazy as _
from .models import CompanyGroup, GroupMembership
from .serializers import (
    CompanyGroupListSerializer,
    CompanyGroupDetailSerializer,
    CompanyGroupCreateUpdateSerializer,
    AddCompaniesToGroupSerializer,
    RemoveCompanyFromGroupSerializer,
    GroupStatisticsSerializer
)


class CompanyGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CompanyGroup model.
    Handles creating, updating, and managing company groups.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get groups owned by the current user."""
        user = self.request.user
        
        # Get only groups owned by user (groups are private)
        queryset = CompanyGroup.objects.filter(owner=user)
        
        # Annotate with companies count
        queryset = queryset.annotate(
            companies_count_annotated=Count('companies')
        )
        
        # Prefetch related data for detail view
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'companies',
                'groupmembership_set__company'
            )
        
        return queryset.order_by('position', 'name')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return CompanyGroupListSerializer
        elif self.action == 'retrieve':
            return CompanyGroupDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CompanyGroupCreateUpdateSerializer
        elif self.action == 'add_companies':
            return AddCompaniesToGroupSerializer
        elif self.action == 'remove_company':
            return RemoveCompanyFromGroupSerializer
        elif self.action == 'statistics':
            return GroupStatisticsSerializer
        return CompanyGroupDetailSerializer
    
    def perform_create(self, serializer):
        """Set the owner to the current user when creating a group."""
        from django.db.models import Max
        user = self.request.user
        
        # Get the next available position
        max_position = CompanyGroup.objects.filter(
            owner=user
        ).aggregate(max_pos=Max('position'))['max_pos'] or -1
        
        serializer.save(owner=user, position=max_position + 1)
    
    def destroy(self, request, *args, **kwargs):
        """Only allow group owner to delete the group."""
        instance = self.get_object()
        if instance.owner != request.user:
            return Response(
                {'message': _('Only the group owner can delete this group.')},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_companies(self, request, pk=None):
        """
        Add multiple companies to a group.
        """
        group = self.get_object()
        
        # Check permissions
        if not self._is_group_owner(request.user, group):
            return Response(
                {'message': _('You do not have permission to edit this group.')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AddCompaniesToGroupSerializer(
            data=request.data,
            context={'request': request, 'group': group}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        return Response({
            'message': _('Companies added successfully.'),
            'added_count': result['added_count']
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated],
            url_path='update_positions')
    def update_positions(self, request, pk=None):
        """
        Update the positions of companies in a group after drag and drop.
        Expects a list of company_ids in the new order.
        """
        group = self.get_object()
        
        # Check permissions
        if not self._is_group_owner(request.user, group):
            return Response(
                {'message': _('You do not have permission to edit this group.')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        company_ids = request.data.get('company_ids', [])
        if not company_ids:
            return Response(
                {'message': _('No company IDs provided.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update positions based on the new order
        for position, company_id in enumerate(company_ids):
            GroupMembership.objects.filter(
                group=group,
                company_id=company_id
            ).update(position=position)
        
        return Response(
            {'message': _('Positions updated successfully.')},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], 
            url_path='remove_company')
    def remove_company(self, request, pk=None):
        """
        Remove a company from a group.
        """
        group = self.get_object()
        
        # Check permissions
        if not self._is_group_owner(request.user, group):
            return Response(
                {'message': _('You do not have permission to edit this group.')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = RemoveCompanyFromGroupSerializer(
            data=request.data,
            context={'request': request, 'group': group}
        )
        serializer.is_valid(raise_exception=True)
        
        company_id = serializer.validated_data['company_id']
        GroupMembership.objects.filter(
            group=group,
            company_id=company_id
        ).delete()
        
        return Response(
            {'message': _('Company removed from group.')},
            status=status.HTTP_200_OK
        )
    
    # Sharing actions removed - groups are private to their creators
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def companies(self, request, pk=None):
        """
        Get all companies in a group with their membership details.
        """
        group = self.get_object()
        
        # Check if user has access to view the group
        if not self._is_group_owner(request.user, group):
            return Response(
                {'message': _('You do not have permission to view this group.')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        memberships = group.groupmembership_set.select_related(
            'company', 'added_by'
        ).order_by('position', 'added_at')
        
        from .serializers import GroupMembershipSerializer
        serializer = GroupMembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated],
            url_path='update_positions')
    def update_group_positions(self, request):
        """
        Update the positions of groups after drag and drop.
        Expects a list of group_ids in the new order.
        """
        user = request.user
        group_ids = request.data.get('group_ids', [])
        
        if not group_ids:
            return Response(
                {'message': _('No group IDs provided.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update positions based on the new order
        for position, group_id in enumerate(group_ids):
            CompanyGroup.objects.filter(
                owner=user,
                id=group_id
            ).update(position=position)
        
        return Response(
            {'message': _('Group positions updated successfully.')},
            status=status.HTTP_200_OK
        )
    
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistics(self, request):
        """
        Get statistics about user's groups.
        """
        user = request.user
        
        # Calculate statistics
        total_groups = CompanyGroup.objects.filter(owner=user).count()
        
        # Total unique companies across all groups
        total_companies = GroupMembership.objects.filter(
            group__owner=user
        ).values('company').distinct().count()
        
        
        
        # Groups by icon
        groups_by_icon = dict(
            CompanyGroup.objects.filter(owner=user).values('icon').annotate(
                count=Count('id')
            ).values_list('icon', 'count')
        )
        
        # Average group size
        group_sizes = CompanyGroup.objects.filter(
            owner=user
        ).annotate(
            size=Count('companies')
        ).values_list('size', flat=True)
        
        avg_group_size = sum(group_sizes) / len(group_sizes) if group_sizes else 0
        
        data = {
            'total_groups': total_groups,
            'total_companies': total_companies,
            'groups_by_icon': groups_by_icon,
            'average_group_size': avg_group_size
        }
        
        serializer = GroupStatisticsSerializer(data)
        return Response(serializer.data)
    
    def _is_group_owner(self, user, group):
        """Check if user owns the group."""
        return group.owner == user


# SharedGroupViewSet removed - groups are private to their creators
