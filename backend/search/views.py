"""Search views for Company Lens."""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import RecentSearch
from .serializers import RecentSearchSerializer

class RecentSearchListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get recent searches for the current user
        recent_searches = RecentSearch.objects.filter(
            user=request.user
        ).order_by('-searched_at')[:10]
        
        serializer = RecentSearchSerializer(recent_searches, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Create a new recent search
        serializer = RecentSearchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClearRecentSearchesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        # Clear all recent searches for the current user
        RecentSearch.objects.filter(user=request.user).delete()
        return Response({"message": "Recent searches cleared"}, status=status.HTTP_204_NO_CONTENT)
