"""
User URLs for Company Lens.
"""

from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('preferences/', views.UserPreferencesView.as_view(), name='user_preferences'),
    path('avatar/', views.UserAvatarView.as_view(), name='user_avatar'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
]