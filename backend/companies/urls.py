"""
Company URLs for Company Lens API.
Uses Django REST Framework routers for ViewSets.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'companies'

# Create router and register ViewSets
router = DefaultRouter()
router.register(r'companies', views.CompanyViewSet, basename='company')
router.register(r'establishments', views.EstablishmentViewSet, basename='establishment')
router.register(r'financials', views.FinancialDataViewSet, basename='financial')

# URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]

# The router automatically creates these URLs:
# companies/
#   - GET: list companies
#   - POST: create company
# companies/{id}/
#   - GET: retrieve company
#   - PUT: update company
#   - PATCH: partial update
#   - DELETE: delete company
# companies/search/ (custom action)
# companies/statistics/ (custom action)
# companies/followed/ (custom action)
# companies/recent/ (custom action)
# companies/{id}/follow/ (custom action)
# companies/{id}/unfollow/ (custom action)
# companies/{id}/establishments/ (custom action)
# companies/{id}/financials/ (custom action)
# 
# establishments/
#   - GET: list establishments
#   - POST: create establishment
# establishments/{id}/
#   - GET, PUT, PATCH, DELETE
#
# financials/
#   - GET: list financial data
#   - POST: create financial data
# financials/{id}/
#   - GET, PUT, PATCH, DELETE
# financials/trends/ (custom action)