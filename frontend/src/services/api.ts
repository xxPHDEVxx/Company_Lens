// API service functions

import type { 
  Company, 
  CompanyGroup, 
  RecentSearch, 
  User, 
  AuthResponse,
  SearchFilters 
} from '../types/api';
import { config } from '../config/environment';
import { transformResponse, transformRequest } from '../utils/caseTransform';

const API_BASE_URL = config.API_BASE_URL + '/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Company APIs
export const companyApi = {
  getAll: async (): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch companies');
    const data = await response.json();
    // Transform and handle paginated response
    const transformed = transformResponse(data);
    return transformed.results || transformed;
  },

  getFollowed: async (): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/companies/followed`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch followed companies');
    const data = await response.json();
    // Transform and handle paginated response
    const transformed = transformResponse(data);
    return transformed.results || transformed;
  },

  getById: async (id: string): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch company');
    const data = await response.json();
    
    // Fetch establishments separately
    const estResponse = await fetch(`${API_BASE_URL}/companies/${id}/establishments/`, {
      headers: getAuthHeaders(),
    });
    const establishments = estResponse.ok ? await estResponse.json() : [];
    
    // Transform the response to camelCase
    const transformedData = transformResponse(data);
    const transformedEstablishments = transformResponse(establishments);
    
    return {
      ...transformedData,
      establishments: transformedEstablishments,
    };
  },

  search: async (filters: Partial<SearchFilters>): Promise<Company[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await fetch(`${API_BASE_URL}/companies/search?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to search companies');
    const data = await response.json();
    // Transform and handle paginated response
    const transformed = transformResponse(data);
    return transformed.results || transformed;
  },

  create: async (company: Partial<Company>): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transformRequest(company)),
    });
    if (!response.ok) throw new Error('Failed to create company');
    const data = await response.json();
    return transformResponse(data);
  },

  update: async (id: string, updates: Partial<Company>): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transformRequest(updates)),
    });
    if (!response.ok) throw new Error('Failed to update company');
    const data = await response.json();
    return transformResponse(data);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete company');
  },

  follow: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}/follow/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to follow company');
  },

  unfollow: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}/unfollow/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to unfollow company');
  },
};

// Group APIs
export const groupApi = {
  getAll: async (): Promise<CompanyGroup[]> => {
    const response = await fetch(`${API_BASE_URL}/groups/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch groups');
    const data = await response.json();
    // Handle paginated response - extract results array
    const groups = data.results || data;
    // Transform snake_case to camelCase for each group
    return groups.map((group: any) => ({
      ...group,
      companiesCount: group.companies_count || 0,
      createdAt: group.created_at,
      updatedAt: group.updated_at || group.created_at,
    }));
  },

  getById: async (id: string): Promise<CompanyGroup> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch group');
    const data = await response.json();
    // Transform snake_case to camelCase
    return {
      ...data,
      companiesCount: data.companies_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };
  },

  create: async (group: Partial<CompanyGroup>): Promise<CompanyGroup> => {
    const response = await fetch(`${API_BASE_URL}/groups/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(group),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error('Failed to create group') as any;
      error.response = { data: errorData };
      throw error;
    }
    const data = await response.json();
    // Transform snake_case to camelCase
    return {
      ...data,
      companiesCount: data.companies_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };
  },

  update: async (id: string, updates: Partial<CompanyGroup>): Promise<CompanyGroup> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new Error('Failed to update group') as any;
      error.response = { data: errorData };
      throw error;
    }
    const data = await response.json();
    // Transform snake_case to camelCase
    return {
      ...data,
      companiesCount: data.companies_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at || data.created_at,
    };
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete group');
  },

  updateGroupPositions: async (groupIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/update_positions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ group_ids: groupIds }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update group positions' }));
      throw new Error(error.message || 'Failed to update group positions');
    }
  },

  getCompanies: async (groupId: string): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/companies/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch group companies');
    const data = await response.json();
    // The backend returns membership objects with nested companies
    // Extract the company objects from the membership data
    const memberships = data.results || data;
    return memberships.map((membership: any) => membership.company);
  },

  addCompanies: async (groupId: string, companyIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/add_companies/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ company_ids: companyIds }), // Changed to match Django API
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add companies to group' }));
      throw new Error(error.message || 'Failed to add companies to group');
    }
    return response.json();
  },

  removeCompany: async (groupId: string, companyId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/remove_company/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ company_id: companyId }), // Backend expects company_id in body
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove company from group' }));
      throw new Error(error.message || 'Failed to remove company from group');
    }
  },

  updatePositions: async (groupId: string, companyIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/update_positions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ company_ids: companyIds }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update positions' }));
      throw new Error(error.message || 'Failed to update positions');
    }
  },
};

// Recent searches APIs
export const recentSearchApi = {
  getAll: async (): Promise<RecentSearch[]> => {
    const response = await fetch(`${API_BASE_URL}/recent-searches`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recent searches');
    return response.json();
  },

  add: async (search: { name: string; vat: string; company_id: string }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/recent-searches/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(search),
    });
    if (!response.ok) throw new Error('Failed to add recent search');
  },

  clear: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/recent-searches/clear/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to clear recent searches');
  },
};

// Auth APIs
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return transformResponse(data);
  },

  signup: async (userData: {
    email: string;
    password: string;
    name: string;
    companyId?: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to signup');
    }
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get current user');
    const data = await response.json();
    return transformResponse(data);
  },

  getUserCompany: async (): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/auth/user/company/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get user company');
    const data = await response.json();
    return transformResponse(data);
  },

  updateUserCompany: async (data: Partial<Company>): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/auth/user/company/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(transformRequest(data)),
    });
    if (!response.ok) throw new Error('Failed to update company');
    const responseData = await response.json();
    return transformResponse(responseData);
  },

  removeUserCompany: async (): Promise<{ message: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/auth/user/company/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove company');
    const data = await response.json();
    return transformResponse(data);
  },
};