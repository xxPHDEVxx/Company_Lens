import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { queryKeys } from '../../lib/queryClient';
import type { User, AuthResponse } from '../../types/api';

// Query Hooks

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getCurrentUser,
    retry: false,
    enabled: !!localStorage.getItem('authToken'),
  });
};

// Get user's company
export const useUserCompany = () => {
  return useQuery({
    queryKey: ['user', 'company'],
    queryFn: authApi.getUserCompany,
    retry: false,
    enabled: !!localStorage.getItem('authToken'),
  });
};

// Mutation Hooks

// Login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data: AuthResponse) => {
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
      // Navigate to dashboard
      navigate('/dashboard');
    },
  });
};

// Signup
export const useSignup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (userData: {
      email: string;
      password: string;
      name: string;
      companyId?: string;
    }) => authApi.signup(userData),
    onSuccess: (data: AuthResponse) => {
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);
      // Navigate to dashboard
      navigate('/dashboard');
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Navigate to login
      navigate('/login');
    },
  });
};