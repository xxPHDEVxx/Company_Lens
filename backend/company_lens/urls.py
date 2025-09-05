"""
URL configuration for Company Lens project.

Main URL routing configuration that includes all app-specific URLs.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

# API version prefix
API_PREFIX = 'api/'

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    
    # API endpoints
    path(f'{API_PREFIX}auth/', include('authentication.urls')),
    path(f'{API_PREFIX}', include('companies.urls')),  # Companies ViewSets at root API
    path(f'{API_PREFIX}', include('groups.urls')),     # Groups ViewSets at root API  
    path(f'{API_PREFIX}users/', include('users.urls')),
    path(f'{API_PREFIX}recent-searches/', include('search.urls')),
    
    # Token refresh endpoint (convenience)
    path(f'{API_PREFIX}token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers
handler404 = 'company_lens.views.custom_404'
handler500 = 'company_lens.views.custom_500'