// API Types for Company Lens

export interface Address {
  id?: string;
  street?: string;
  streetNumber?: string;
  postalBox?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  region?: 'flanders' | 'wallonia' | 'brussels';
  country?: string;
  fullAddress?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Establishment {
  id: string;
  unitNumber: string;
  name: string;
  address?: Address;
  creationDate?: string;
  status: 'active' | 'inactive' | 'closed';
}

export interface FinancialData {
  year: number;
  revenue?: number;
  profit?: number;
  margin?: number;
  employees?: number;
}

export interface FinancialMetrics {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  margin: {
    current: number;
    previous: number;
    growth: number;
  };
  profit: {
    current: number;
    previous: number;
    growth: number;
  };
}

export interface Activity {
  id: string;
  nacebelCodes?: string[];
  companyActivities?: string[];
  sectors?: string[];
  services?: string[];
  description?: string;
  primarySector?: string;
  primaryNacebel?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  vat: string;
  legalForm?: string;
  creationDate?: string;
  capital?: string;
  employees?: number;
  fiscalYear?: string;
  lastUpdate?: string;
  companyType?: string;
  companySize?: string;
  city?: string;
  region?: 'flanders' | 'wallonia' | 'brussels';
  followedSince?: string;
  website?: string;
  phone?: string;
  email?: string;
  is_followed?: boolean;
  
  // Related entities
  address?: Address;
  activities?: Activity;
  establishments?: Establishment[];
  financialData?: FinancialData[];
  financialMetrics?: FinancialMetrics;
}

export interface CompanyGroup {
  id: string;
  name: string;
  description: string;
  companiesCount: number;
  createdAt: string;
  icon?: string;
  color?: string;
}

export interface RecentSearch {
  id: string;
  name: string;
  vat: string;
  company_id: string;
  time: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  company_name?: string;
  phone?: string;
  date_joined?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SearchFilters {
  vatNumber: string;
  companyType: string;
  status: string;
  region: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}