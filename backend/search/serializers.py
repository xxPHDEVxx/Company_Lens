"""Search serializers for Company Lens."""

from rest_framework import serializers
from .models import RecentSearch


class RecentSearchSerializer(serializers.ModelSerializer):
    """Serializer for recent searches."""
    query = serializers.CharField(source='search_query', read_only=True)
    filters = serializers.JSONField(source='search_filters', read_only=True)
    
    class Meta:
        model = RecentSearch
        fields = ['id', 'name', 'vat', 'company_id', 'query', 'filters', 'searched_at', 'time']
        read_only_fields = ['id', 'searched_at', 'time']
    
    def validate(self, attrs):
        """Ensure we have at least name and VAT."""
        if not attrs.get('name') or not attrs.get('vat'):
            raise serializers.ValidationError("Name and VAT are required")
        return attrs