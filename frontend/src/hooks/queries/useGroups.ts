import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '../../services/api';
import { queryKeys } from '../../lib/queryClient';
import type { CompanyGroup, Company } from '../../types/api';

// Query Hooks

// Fetch all groups
export const useGroups = () => {
  return useQuery({
    queryKey: queryKeys.groups.list(),
    queryFn: groupApi.getAll,
  });
};

// Fetch single group by ID
export const useGroup = (id: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.groups.detail(id!),
    queryFn: () => groupApi.getById(id!),
    enabled: !!id,
  });
};

// Fetch companies in a group
export const useGroupCompanies = (groupId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.groups.companies(groupId!),
    queryFn: () => groupApi.getCompanies(groupId!),
    enabled: !!groupId,
  });
};

// Mutation Hooks

// Create group
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (group: Partial<CompanyGroup>) => groupApi.create(group),
    onSuccess: (newGroup) => {
      // Add the new group to the list cache
      queryClient.setQueryData<CompanyGroup[]>(
        queryKeys.groups.list(),
        (old) => [...(old || []), newGroup]
      );
      // Add the new group to its detail cache
      queryClient.setQueryData(
        queryKeys.groups.detail(newGroup.id),
        newGroup
      );
    },
  });
};

// Update group
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CompanyGroup> }) =>
      groupApi.update(id, updates),
    onSuccess: (updatedGroup) => {
      // Update the group in the list cache
      queryClient.setQueryData<CompanyGroup[]>(
        queryKeys.groups.list(),
        (old) => old?.map(group => 
          group.id === updatedGroup.id ? updatedGroup : group
        ) || []
      );
      // Update the group detail cache
      queryClient.setQueryData(
        queryKeys.groups.detail(updatedGroup.id),
        updatedGroup
      );
    },
  });
};

// Delete group
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: groupApi.delete,
    onSuccess: (_, deletedId) => {
      // Remove from list cache
      queryClient.setQueryData<CompanyGroup[]>(
        queryKeys.groups.list(),
        (old) => old?.filter(group => group.id !== deletedId) || []
      );
      // Remove detail cache
      queryClient.removeQueries({ queryKey: queryKeys.groups.detail(deletedId) });
      // Remove companies cache for this group
      queryClient.removeQueries({ queryKey: queryKeys.groups.companies(deletedId) });
    },
  });
};

// Add companies to group
export const useAddCompaniesToGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, companyIds }: { groupId: string; companyIds: string[] }) =>
      groupApi.addCompanies(groupId, companyIds),
    onSuccess: (_, { groupId }) => {
      // Invalidate the group's companies list
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.companies(groupId) });
      // Invalidate the group detail to update company count
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
};

// Remove company from group
export const useRemoveCompanyFromGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, companyId }: { groupId: string; companyId: string }) =>
      groupApi.removeCompany(groupId, companyId),
    onSuccess: (_, { groupId, companyId }) => {
      // Optimistically update the group's companies list
      queryClient.setQueryData<Company[]>(
        queryKeys.groups.companies(groupId),
        (old) => old?.filter(company => company.id !== companyId) || []
      );
      // Invalidate the group detail to update company count
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) });
    },
  });
};