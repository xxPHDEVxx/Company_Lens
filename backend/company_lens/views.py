"""
Custom error handlers for Company Lens.
"""

from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse


def custom_404(request, exception=None):
    """Custom 404 error handler."""
    return JsonResponse({
        'error': 'Not Found',
        'message': 'The requested resource was not found.',
        'status': 404
    }, status=404)


def custom_500(request):
    """Custom 500 error handler."""
    return JsonResponse({
        'error': 'Internal Server Error',
        'message': 'An internal server error occurred. Please try again later.',
        'status': 500
    }, status=500)