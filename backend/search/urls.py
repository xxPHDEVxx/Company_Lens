"""
Search URLs for Company Lens.
"""

from django.urls import path
from . import views

app_name = 'search'

urlpatterns = [
    path('', views.RecentSearchListView.as_view(), name='recent_search_list'),
    path('clear/', views.ClearRecentSearchesView.as_view(), name='clear_recent_searches'),
    path('saved/', views.SavedSearchListCreateView.as_view(), name='saved_search_list'),
    path('saved/<int:pk>/', views.SavedSearchDetailView.as_view(), name='saved_search_detail'),
    path('analytics/', views.SearchAnalyticsView.as_view(), name='search_analytics'),
]