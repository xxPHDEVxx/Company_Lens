// API Types for Company Lens

export interface Address {
  street: string;
  streetNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Establishment {
  id: string;
  unitNumber: string;
  name: string;
  type: 'headquarters' | 'branch' | 'production';
  address: Address;
  phone?: string;
  email?: string;
  employees?: number;
  creationDate: string;
  status: 'active' | 'inactive';
}

export interface FinancialData {
  year: number;
  revenue: number;
  profit: number;
  margin: number;
  employees: number;
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

export interface Company {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  vat: string;
  legalForm: string;
  creationDate: string;
  capital?: string;
  employees?: number;
  naceCodes?: string[];
  activity?: string;
  fiscalYear?: string;
  lastUpdate?: string;
  companyType?: string;
  companySize?: string;
  companyDescription?: string;
  sector?: string;
  city?: string;
  region?: 'flanders' | 'wallonia' | 'brussels';
  followedSince?: string;
  website?: string;
  address?: Address;
  phone?: string;
  email?: string;
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