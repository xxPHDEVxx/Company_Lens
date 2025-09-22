"""
Search URLs for Company Lens.
"""

from django.urls import path
from . import views

app_name = 'search'

urlpatterns = [
    path('', views.RecentSearchListView.as_view(), name='recent_search_list'),
    path('clear/', views.ClearRecentSearchesView.as_view(), name='clear_recent_searches'),
]