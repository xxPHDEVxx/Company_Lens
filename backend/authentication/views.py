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
from companies.models import Company
from companies.serializers import CompanyDetailSerializer
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
    
    def patch(self, request):
        """Partial update current user profile."""
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


class UserCompanyView(APIView):
    """
    Manage user's associated company.
    Allows updating limited fields and removing the company association.
    """
    permission_classes = [IsAuthenticated]
    
    def _update_company_activities(self, company, activities_data):
        """Helper method to update or create company activities"""
        from companies.models import Activity
        
        if hasattr(company, 'activities'):
            activity = company.activities
            # Update main activity (stored as first item in sectors)
            if 'main_activity' in activities_data:
                existing_sectors = activity.sectors or []
                if existing_sectors:
                    existing_sectors[0] = activities_data['main_activity']
                else:
                    existing_sectors = [activities_data['main_activity']]
                activity.sectors = existing_sectors
            
            # Update other fields
            if 'secondary_activities' in activities_data:
                activity.company_activities = activities_data['secondary_activities']
            if 'nacebel_codes' in activities_data:
                activity.nacebel_codes = activities_data['nacebel_codes']
            if 'description' in activities_data:
                activity.description = activities_data['description']
            activity.save()
        else:
            # Create new activity
            Activity.objects.create(
                company=company,
                sectors=[activities_data.get('main_activity', '')] if activities_data.get('main_activity') else [],
                company_activities=activities_data.get('secondary_activities', []),
                nacebel_codes=activities_data.get('nacebel_codes', []),
                description=activities_data.get('description', '')
            )
    
    def get(self, request):
        """Get the user's associated company details."""
        if not request.user.company_id:
            return Response(
                {'message': _('No company associated with this user.')},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            company = Company.objects.get(id=request.user.company_id)
            serializer = CompanyDetailSerializer(company)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response(
                {'message': _('Company not found.')},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request):
        """
        Update user's company.
        Allows updating all fields except VAT number.
        Handles nested objects for activities, address, and contact.
        """
        if not request.user.company_id:
            return Response(
                {'message': _('No company associated with this user.')},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            company = Company.objects.get(id=request.user.company_id)
            
            # Remove VAT number fields (not allowed to change)
            update_data = request.data.copy()
            vat_fields = ['vat_number', 'vatNumber', 'vat']
            for field in vat_fields:
                update_data.pop(field, None)
            
            # Handle activities nested data
            if 'activities' in update_data:
                activities_data = update_data.pop('activities')
                self._update_company_activities(company, activities_data)
            
            # Update company fields using the serializer for validation
            from companies.serializers import CompanyCreateUpdateSerializer
            serializer = CompanyCreateUpdateSerializer(company, data=update_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            # Refresh from DB and return with detail serializer
            company.refresh_from_db()
            detail_serializer = CompanyDetailSerializer(company)
            return Response(detail_serializer.data, status=status.HTTP_200_OK)
        except Company.DoesNotExist:
            return Response(
                {'message': _('Company not found.')},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request):
        """Remove the company association from the user (not delete the company itself)."""
        if not request.user.company_id:
            return Response(
                {'message': _('No company associated with this user.')},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Remove company association
        request.user.company_id = None
        request.user.save()
        
        # Return updated user data
        serializer = UserSerializer(request.user)
        return Response(
            {
                'message': _('Company association removed successfully.'),
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )