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
from .models import CompanyGroup, GroupMembership, SharedGroup
from .serializers import (
    CompanyGroupListSerializer,
    CompanyGroupDetailSerializer,
    CompanyGroupCreateUpdateSerializer,
    AddCompaniesToGroupSerializer,
    RemoveCompanyFromGroupSerializer,
    SharedGroupSerializer,
    ShareGroupSerializer,
    GroupStatisticsSerializer
)


class CompanyGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CompanyGroup model.
    Handles creating, updating, and managing company groups.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get groups owned by or shared with the current user."""
        user = self.request.user
        
        # Get groups owned by user
        owned_groups = CompanyGroup.objects.filter(owner=user)
        
        # Get groups shared with user
        shared_group_ids = SharedGroup.objects.filter(
            shared_with=user
        ).values_list('group_id', flat=True)
        
        # Combine queries
        queryset = CompanyGroup.objects.filter(
            Q(owner=user) | Q(id__in=shared_group_ids)
        ).distinct()
        
        # Filter by public groups if requested
        show_public = self.request.query_params.get('show_public', 'false').lower() == 'true'
        if show_public:
            queryset = queryset | CompanyGroup.objects.filter(is_public=True)
        
        # Annotate with companies count
        queryset = queryset.annotate(
            companies_count_annotated=Count('companies')
        )
        
        # Prefetch related data for detail view
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'companies',
                'groupmembership_set__company',
                'shares__shared_with'
            )
        
        return queryset.order_by('name')
    
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
        elif self.action == 'share':
            return ShareGroupSerializer
        elif self.action == 'statistics':
            return GroupStatisticsSerializer
        return CompanyGroupDetailSerializer
    
    def perform_create(self, serializer):
        """Set the owner to the current user when creating a group."""
        serializer.save(owner=self.request.user)
    
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
        if not self._can_edit_group(request.user, group):
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
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_company(self, request, pk=None):
        """
        Remove a company from a group.
        """
        group = self.get_object()
        
        # Check permissions
        if not self._can_edit_group(request.user, group):
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def share(self, request, pk=None):
        """
        Share a group with other users.
        """
        group = self.get_object()
        
        # Only owner can share the group
        if group.owner != request.user:
            return Response(
                {'message': _('Only the group owner can share this group.')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ShareGroupSerializer(
            data=request.data,
            context={'request': request, 'group': group}
        )
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        
        return Response({
            'message': _('Group shared successfully.'),
            'shared_count': result['shared_count']
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unshare(self, request, pk=None):
        """
        Remove sharing for specific users.
        """
        group = self.get_object()
        
        # Only owner can unshare
        if group.owner != request.user:
            return Response(
                {'message': _('Only the group owner can manage sharing.')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'message': _('User ID is required.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count = SharedGroup.objects.filter(
            group=group,
            shared_with_id=user_id
        ).delete()[0]
        
        if deleted_count:
            return Response(
                {'message': _('Sharing removed successfully.')},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'message': _('This group is not shared with the specified user.')},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def companies(self, request, pk=None):
        """
        Get all companies in a group with their membership details.
        """
        group = self.get_object()
        
        # Check if user has access to view the group
        if not self._can_view_group(request.user, group):
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
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_groups(self, request):
        """
        Get only groups owned by the current user.
        """
        groups = CompanyGroup.objects.filter(
            owner=request.user
        ).annotate(
            companies_count_annotated=Count('companies')
        ).order_by('name')
        
        serializer = CompanyGroupListSerializer(groups, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def shared_with_me(self, request):
        """
        Get groups shared with the current user.
        """
        shared = SharedGroup.objects.filter(
            shared_with=request.user
        ).select_related('group', 'group__owner', 'shared_by')
        
        groups = []
        for share in shared:
            group_data = CompanyGroupListSerializer(share.group).data
            group_data['permission'] = share.permission
            group_data['shared_by'] = share.shared_by.name
            group_data['shared_at'] = share.shared_at
            groups.append(group_data)
        
        return Response(groups)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def public(self, request):
        """
        Get all public groups.
        """
        groups = CompanyGroup.objects.filter(
            is_public=True
        ).annotate(
            companies_count_annotated=Count('companies')
        ).order_by('-companies_count_annotated', 'name')[:50]
        
        serializer = CompanyGroupListSerializer(groups, many=True)
        return Response(serializer.data)
    
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
        
        # Shared groups
        shared_groups = SharedGroup.objects.filter(
            group__owner=user
        ).values('group').distinct().count()
        
        # Public groups
        public_groups = CompanyGroup.objects.filter(
            owner=user,
            is_public=True
        ).count()
        
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
            'shared_groups': shared_groups,
            'public_groups': public_groups,
            'groups_by_icon': groups_by_icon,
            'average_group_size': avg_group_size
        }
        
        serializer = GroupStatisticsSerializer(data)
        return Response(serializer.data)
    
    def _can_view_group(self, user, group):
        """Check if user can view a group."""
        # Owner can always view
        if group.owner == user:
            return True
        
        # Check if group is public
        if group.is_public:
            return True
        
        # Check if group is shared with user
        return SharedGroup.objects.filter(
            group=group,
            shared_with=user
        ).exists()
    
    def _can_edit_group(self, user, group):
        """Check if user can edit a group."""
        # Owner can always edit
        if group.owner == user:
            return True
        
        # Check if user has edit or admin permission
        try:
            share = SharedGroup.objects.get(group=group, shared_with=user)
            return share.permission in ['edit', 'admin']
        except SharedGroup.DoesNotExist:
            return False


class SharedGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing shared group relationships.
    Read-only access to see who groups are shared with.
    """
    
    serializer_class = SharedGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get shares for groups owned by or shared with the current user."""
        user = self.request.user
        
        # Get shares for groups owned by user or shared with user
        return SharedGroup.objects.filter(
            Q(group__owner=user) | Q(shared_with=user)
        ).select_related(
            'group', 'shared_with', 'shared_by'
        ).order_by('-shared_at')
