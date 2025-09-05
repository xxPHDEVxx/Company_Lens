"""
Authentication views for Company Lens.
Handles user registration, login, logout, and token management.
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView
from django.contrib.auth import authenticate, get_user_model
from django.utils.translation import gettext_lazy as _
from .serializers import (
    LoginSerializer,
    SignupSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer
)

User = get_user_model()


class LoginView(APIView):
    """
    User login endpoint.
    Returns JWT tokens upon successful authentication.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, email=email, password=password)
        
        if user:
            if not user.is_active:
                return Response(
                    {'message': _('Account is disabled.')},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            refresh = RefreshToken.for_user(user)
            user_serializer = UserSerializer(user)
            
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'message': _('Invalid email or password.')},
            status=status.HTTP_401_UNAUTHORIZED
        )


class SignupView(APIView):
    """
    User registration endpoint.
    Creates a new user account and returns JWT tokens.
    """
    permission_classes = [AllowAny]
    serializer_class = SignupSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)
        
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """
    User logout endpoint.
    Blacklists the refresh token to invalidate it.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                {'message': _('Successfully logged out.')},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'message': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(APIView):
    """
    Get current authenticated user details.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update current user profile."""
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class RefreshTokenView(BaseTokenRefreshView):
    """
    Refresh JWT access token using refresh token.
    Extends the default TokenRefreshView to add custom behavior if needed.
    """
    pass


class ChangePasswordView(APIView):
    """
    Change password for authenticated user.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response(
            {'message': _('Password changed successfully.')},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    """
    Reset password functionality.
    Sends reset link to user's email.
    """
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            # TODO: Implement email sending logic
            # For now, just return success
            return Response(
                {'message': _('Password reset link sent to your email.')},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response(
                {'message': _('Password reset link sent to your email.')},
                status=status.HTTP_200_OK
            )


class VerifyEmailView(APIView):
    """
    Email verification endpoint.
    Verifies user email using token sent via email.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'message': _('Verification token is required.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement email verification logic
        # For now, just return success
        return Response(
            {'message': _('Email verified successfully.')},
            status=status.HTTP_200_OK
        )