import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../../services/api';
import { queryKeys } from '../../lib/queryClient';
import type { Company, SearchFilters } from '../../types/api';

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
  });
};

// Search companies
export const useCompanySearch = (filters: Partial<SearchFilters>, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.companies.search(filters),
    queryFn: () => companyApi.search(filters),
    enabled: enabled && Object.keys(filters).length > 0,
  });
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
        (old) => old ? { ...old, isFollowed: true } : old
      );
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
        (old) => old ? { ...old, isFollowed: false } : old
      );
    },
  });
};