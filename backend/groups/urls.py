"""
Group URLs for Company Lens API.
Uses Django REST Framework routers for ViewSets.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'groups'

# Create router and register ViewSets
router = DefaultRouter()
router.register(r'groups', views.CompanyGroupViewSet, basename='group')
router.register(r'shared', views.SharedGroupViewSet, basename='shared')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]

# The router automatically creates these URLs:
# groups/
#   - GET: list groups
#   - POST: create group
# groups/{id}/
#   - GET: retrieve group
#   - PUT: update group
#   - PATCH: partial update
#   - DELETE: delete group
# groups/{id}/add_companies/ (custom action)
# groups/{id}/remove_company/ (custom action)
# groups/{id}/share/ (custom action)
# groups/{id}/unshare/ (custom action)
# groups/{id}/companies/ (custom action)
# groups/my_groups/ (custom action)
# groups/shared_with_me/ (custom action)
# groups/public/ (custom action)
# groups/statistics/ (custom action)
#
# shared/
#   - GET: list shared groups (read-only)
# shared/{id}/
#   - GET: retrieve shared group details (read-only)