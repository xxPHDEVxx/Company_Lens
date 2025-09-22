"""
Authentication serializers for Company Lens.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    # Map company_id to companyId for frontend compatibility
    companyId = serializers.CharField(source='company_id', read_only=True, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'companyId', 'phone',
            'avatar', 'bio', 'language', 'email_notifications',
            'date_joined', 'last_login', 'is_active'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'companyId']
        extra_kwargs = {
            'avatar': {'required': False, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
        }


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_email(self, value):
        """Normalize email address."""
        return value.lower().strip()


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'name', 'password', 'password_confirm',
            'company_id', 'phone', 'language'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'name': {'required': True},
            'company_id': {'required': False, 'allow_null': True},
            'phone': {'required': False, 'allow_blank': True},
            'language': {'required': False},
        }
    
    def validate_email(self, value):
        """Check if email is already registered."""
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                _('A user with this email already exists.')
            )
        return email
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': _('Passwords do not match.')
            })
        return attrs
    
    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate that old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                _('Current password is incorrect.')
            )
        return value
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('New passwords do not match.')
            })
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Normalize email address."""
        return value.lower().strip()


class ResetPasswordConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('Passwords do not match.')
            })
        return attrs