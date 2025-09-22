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
# Sharing removed - groups are private to their creators

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]

# The router automatically creates these URLs:
# groups/
#   - GET: list groups (private to user)
#   - POST: create group
# groups/{id}/
#   - GET: retrieve group (if owner)
#   - PUT: update group (if owner)
#   - PATCH: partial update (if owner)
#   - DELETE: delete group (if owner)
# groups/{id}/add_companies/ (custom action)
# groups/{id}/remove_company/ (custom action)
# groups/{id}/companies/ (custom action)
# groups/my_groups/ (custom action)
# groups/statistics/ (custom action)