"""User views for Company Lens."""

import logging
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import UserProfileSerializer, AssociateCompanySerializer
from companies.models import Company
from companies.tasks import fetch_company_data_async

logger = logging.getLogger(__name__)
User = get_user_model()


class UserProfileView(APIView):
    """
    View for getting and updating user profile information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current user's profile."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """Update user profile (excluding company_id)."""
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssociateCompanyView(APIView):
    """
    View for associating a company with a user.
    If the company doesn't exist, it triggers the scraper to fetch it.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Associate a company with the current user by VAT number.
        If the company doesn't exist in DB, it triggers the AI scraper.

        Request body:
        {
            "company_vat": "BE0123456789" or "0123456789"
        }

        Returns:
        - 200: Company exists and was associated
        - 202: Company doesn't exist, scraper launched
        - 400: Invalid VAT format
        """
        serializer = AssociateCompanySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        vat_number = serializer.validated_data['company_vat']

        # Check if company exists in database
        try:
            company = Company.objects.get(vat=vat_number)

            # Company exists - associate it immediately
            request.user.company_id = company.id
            request.user.save()

            logger.info(
                f"Associated existing company {vat_number} with user {request.user.email}"
            )

            return Response({
                'status': 'success',
                'message': 'Company successfully associated with your account',
                'company': {
                    'id': company.id,
                    'vat': company.vat,
                    'name': company.name,
                    'status': company.status
                }
            }, status=status.HTTP_200_OK)

        except Company.DoesNotExist:
            # Company doesn't exist - launch scraper
            logger.info(
                f"Company {vat_number} not found. Launching scraper for user {request.user.email}"
            )

            # Launch async scraper task with user_id
            # The user's company_id will be updated automatically once scraping completes
            task = fetch_company_data_async.delay(vat_number, request.user.id)

            return Response({
                'status': 'pending',
                'message': (
                    'Company not found in database. '
                    'We are currently fetching the company data. '
                    'This may take a few moments.'
                ),
                'task_id': task.id,
                'vat_number': vat_number
            }, status=status.HTTP_202_ACCEPTED)

    def delete(self, request):
        """Remove company association from user."""
        if not request.user.company_id:
            return Response({
                'status': 'error',
                'message': 'No company is currently associated with your account'
            }, status=status.HTTP_400_BAD_REQUEST)

        old_company_id = request.user.company_id
        request.user.company_id = None
        request.user.save()

        logger.info(
            f"Removed company {old_company_id} from user {request.user.email}"
        )

        return Response({
            'status': 'success',
            'message': 'Company association removed from your account'
        }, status=status.HTTP_200_OK)


class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({"message": "User preferences"})
    
    def put(self, request):
        return Response({"message": "Update user preferences"})


class UserAvatarView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({"message": "Upload avatar"})
    
    def delete(self, request):
        return Response({"message": "Delete avatar"})


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        return Response({"message": f"User detail for {pk}"})
