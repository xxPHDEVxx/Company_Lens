"""
Custom pagination classes for Company Lens API.
"""
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class that allows clients to override page size.

    - Default page size: 200 items
    - Client can request different size via ?page_size=X
    - Maximum allowed page size: 500 items
    """
    page_size = 200
    page_size_query_param = 'page_size'
    max_page_size = 500