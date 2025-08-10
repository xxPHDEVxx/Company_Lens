import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recentSearchApi } from '../../services/api';
import { queryKeys } from '../../lib/queryClient';
import type { RecentSearch } from '../../types/api';

// Query Hooks

// Fetch recent searches
export const useRecentSearches = () => {
  return useQuery({
    queryKey: queryKeys.recentSearches.list(),
    queryFn: recentSearchApi.getAll,
  });
};

// Mutation Hooks

// Add recent search
export const useAddRecentSearch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (search: { name: string; vat: string }) => 
      recentSearchApi.add(search),
    onSuccess: () => {
      // Invalidate recent searches to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.recentSearches.list() });
    },
  });
};

// Clear recent searches
export const useClearRecentSearches = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: recentSearchApi.clear,
    onSuccess: () => {
      // Clear the cache immediately
      queryClient.setQueryData<RecentSearch[]>(
        queryKeys.recentSearches.list(),
        []
      );
    },
  });
};