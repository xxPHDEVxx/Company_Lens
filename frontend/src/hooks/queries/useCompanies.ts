import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../../services/api';
import { queryKeys } from '../../lib/queryClient';
import type { Company, SearchFilters } from '../../types/api';
import { useState, useEffect } from 'react';

// Query Hooks

// Fetch all companies
export const useCompanies = () => {
  return useQuery({
    queryKey: queryKeys.companies.lists(),
    queryFn: companyApi.getAll,
  });
};

// Fetch followed companies
export const useFollowedCompanies = () => {
  return useQuery({
    queryKey: queryKeys.companies.followed(),
    queryFn: companyApi.getFollowed,
  });
};

// Fetch single company by ID
export const useCompany = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.companies.detail(id!),
    queryFn: () => companyApi.getById(id!),
    enabled: !!id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

// Search companies with AI scraper polling support
export const useCompanySearch = (filters: Partial<SearchFilters>, enabled = true) => {
  const [pollingVat, setPollingVat] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  // Main search query
  const searchQuery = useQuery({
    queryKey: queryKeys.companies.search(filters),
    queryFn: async () => {
      try {
        return await companyApi.search(filters);
      } catch (error: any) {
        // If AI scraper is fetching (status 202), start polling
        if (error.status === 202) {
          setPollingVat(error.vat);
          setPollCount(0);
          throw error; // Re-throw to show loading state
        }
        throw error;
      }
    },
    enabled: enabled && Object.keys(filters).length > 0,
    retry: false, // Don't retry on 202 status
  });

  // Polling query for AI scraper fetch status
  const pollingQuery = useQuery({
    queryKey: ['companyFetchStatus', pollingVat],
    queryFn: () => companyApi.checkFetchStatus(pollingVat!),
    enabled: !!pollingVat && pollCount < 60, // Poll for max 2 minutes (60 * 2s intervals)
    refetchInterval: 2000, // Poll every 2 seconds
    onSuccess: (data) => {
      if (data.status === 'completed' && data.data) {
        // Fetch completed successfully
        setPollingVat(null);
        setPollCount(0);
        // Invalidate search query to show the new company
        searchQuery.refetch();
      } else if (data.status === 'failed') {
        // Fetch failed
        setPollingVat(null);
        setPollCount(0);
      } else {
        // Still pending, increment poll count
        setPollCount(prev => prev + 1);
      }
    },
  });

  // Stop polling after max attempts
  useEffect(() => {
    if (pollCount >= 60) {
      setPollingVat(null);
      setPollCount(0);
    }
  }, [pollCount]);

  return {
    ...searchQuery,
    isFetching: searchQuery.isFetching || !!pollingVat,
    fetchStatus: pollingVat ? (pollingQuery.data?.status || 'pending') : null,
    fetchMessage: pollingQuery.data?.message,
  };
};

// Mutation Hooks

// Create company
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (company: Partial<Company>) => companyApi.create(company),
    onSuccess: (newCompany) => {
      // Invalidate and refetch company lists
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
      // Add the new company to the cache
      queryClient.setQueryData(
        queryKeys.companies.detail(newCompany.id),
        newCompany
      );
    },
  });
};

// Update company
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Company> }) =>
      companyApi.update(id, updates),
    onSuccess: (updatedCompany) => {
      // Update the company in all relevant caches
      queryClient.setQueryData(
        queryKeys.companies.detail(updatedCompany.id),
        updatedCompany
      );
      // Invalidate lists to ensure they reflect the update
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.followed() });
    },
  });
};

// Delete company
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.companies.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.followed() });
    },
  });
};

// Follow company
export const useFollowCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyApi.follow,
    onSuccess: (_, companyId) => {
      // Invalidate followed companies list
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.followed() });
      // Update the company detail if it exists in cache
      queryClient.setQueryData<Company>(
        queryKeys.companies.detail(companyId),
        (old) => old ? { ...old, is_followed: true } : old
      );
      // Invalidate company detail to get fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
    },
  });
};

// Unfollow company
export const useUnfollowCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: companyApi.unfollow,
    onSuccess: (_, companyId) => {
      // Optimistically update the followed companies list
      queryClient.setQueryData<Company[]>(
        queryKeys.companies.followed(),
        (old) => old ? old.filter(company => company.id !== companyId) : []
      );
      // Update the company detail if it exists in cache
      queryClient.setQueryData<Company>(
        queryKeys.companies.detail(companyId),
        (old) => old ? { ...old, is_followed: false } : old
      );
      // Invalidate company detail to get fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
    },
  });
};