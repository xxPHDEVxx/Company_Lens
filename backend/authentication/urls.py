"""
Authentication URLs for Company Lens.
"""

from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('user/profile/', views.CurrentUserView.as_view(), name='user_profile'),  # Alternative endpoint
    path('refresh/', views.RefreshTokenView.as_view(), name='refresh_token'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('reset-password/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
]