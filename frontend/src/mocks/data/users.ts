import type { User } from '../../types/api';

// Mock users database
export const usersDb: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Jean Dupont',
    companyId: '1', // TechVision SA
  },
];

// Mock authentication token
export const mockToken = 'mock-jwt-token-12345';