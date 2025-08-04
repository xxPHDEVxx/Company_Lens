// API service functions

import type { 
  Company, 
  CompanyGroup, 
  RecentSearch, 
  User, 
  AuthResponse,
  SearchFilters 
} from '../types/api';

const API_BASE_URL = '/api';

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
    return response.json();
  },

  getFollowed: async (): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/companies/followed`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch followed companies');
    return response.json();
  },

  getById: async (id: string): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch company');
    return response.json();
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
    return response.json();
  },

  create: async (company: Partial<Company>): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(company),
    });
    if (!response.ok) throw new Error('Failed to create company');
    return response.json();
  },

  update: async (id: string, updates: Partial<Company>): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update company');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete company');
  },

  follow: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}/follow`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to follow company');
  },

  unfollow: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/companies/${id}/follow`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to unfollow company');
  },
};

// Group APIs
export const groupApi = {
  getAll: async (): Promise<CompanyGroup[]> => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch groups');
    return response.json();
  },

  getById: async (id: string): Promise<CompanyGroup> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch group');
    return response.json();
  },

  create: async (group: Partial<CompanyGroup>): Promise<CompanyGroup> => {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(group),
    });
    if (!response.ok) throw new Error('Failed to create group');
    return response.json();
  },

  update: async (id: string, updates: Partial<CompanyGroup>): Promise<CompanyGroup> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update group');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete group');
  },

  getCompanies: async (groupId: string): Promise<Company[]> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/companies`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch group companies');
    return response.json();
  },

  addCompanies: async (groupId: string, companyIds: string[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/companies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ companyIds }),
    });
    if (!response.ok) throw new Error('Failed to add companies to group');
  },

  removeCompany: async (groupId: string, companyId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/companies/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove company from group');
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

  add: async (search: { name: string; vat: string }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/recent-searches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(search),
    });
    if (!response.ok) throw new Error('Failed to add recent search');
  },

  clear: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/recent-searches`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to clear recent searches');
  },
};

// Auth APIs
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    return data;
  },

  signup: async (userData: {
    email: string;
    password: string;
    name: string;
    companyId?: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
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
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  },
};