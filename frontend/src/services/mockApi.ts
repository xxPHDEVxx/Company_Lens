// Mock API for testing when backend is not available
import type { Company, CompanyGroup } from '../types/api';

// Mock data
let mockGroups: CompanyGroup[] = [
  {
    id: '1',
    name: 'Concurrents principaux',
    description: 'Nos principaux concurrents sur le marché belge',
    companiesCount: 3,
    createdAt: '2024-01-15T10:00:00Z',
    icon: 'competition',
  },
  {
    id: '2',
    name: 'Partenaires stratégiques',
    description: 'Entreprises avec lesquelles nous collaborons régulièrement',
    companiesCount: 5,
    createdAt: '2024-01-20T14:30:00Z',
    icon: 'partners',
  },
];

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Belgium',
    status: 'active',
    vat: 'BE0123456789',
    legalForm: 'SA',
    creationDate: '2020-01-01',
    employees: 150,
    sector: 'Technologies',
    city: 'Bruxelles',
    region: 'brussels',
  },
  {
    id: '2',
    name: 'InnovateLab Wallonie',
    status: 'active',
    vat: 'BE0987654321',
    legalForm: 'SPRL',
    creationDate: '2019-05-15',
    employees: 75,
    sector: 'Innovation',
    city: 'Namur',
    region: 'wallonia',
  },
  {
    id: '3',
    name: 'DataSolutions Flanders',
    status: 'active',
    vat: 'BE0456789123',
    legalForm: 'NV',
    creationDate: '2018-09-01',
    employees: 200,
    sector: 'Data Analytics',
    city: 'Gent',
    region: 'flanders',
  },
];

let groupCompanies: Record<string, string[]> = {
  '1': ['1', '2'],
  '2': ['3'],
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API implementation
export const mockGroupApi = {
  getAll: async (): Promise<CompanyGroup[]> => {
    await delay(500);
    return mockGroups;
  },

  getById: async (id: string): Promise<CompanyGroup> => {
    await delay(300);
    const group = mockGroups.find(g => g.id === id);
    if (!group) throw new Error('Group not found');
    return group;
  },

  create: async (group: Partial<CompanyGroup>): Promise<CompanyGroup> => {
    await delay(500);
    const newGroup: CompanyGroup = {
      id: Date.now().toString(),
      name: group.name || '',
      description: group.description || '',
      companiesCount: 0,
      createdAt: new Date().toISOString(),
      icon: group.icon,
    };
    mockGroups.push(newGroup);
    groupCompanies[newGroup.id] = [];
    return newGroup;
  },

  update: async (id: string, updates: Partial<CompanyGroup>): Promise<CompanyGroup> => {
    await delay(500);
    const index = mockGroups.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Group not found');
    
    mockGroups[index] = {
      ...mockGroups[index],
      ...updates,
    };
    return mockGroups[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockGroups.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Group not found');
    
    mockGroups.splice(index, 1);
    delete groupCompanies[id];
  },

  getCompanies: async (groupId: string): Promise<Company[]> => {
    await delay(300);
    const companyIds = groupCompanies[groupId] || [];
    return mockCompanies.filter(c => companyIds.includes(c.id));
  },

  addCompanies: async (groupId: string, companyIds: string[]): Promise<void> => {
    await delay(500);
    if (!groupCompanies[groupId]) {
      groupCompanies[groupId] = [];
    }
    
    // Add unique company IDs
    const currentIds = new Set(groupCompanies[groupId]);
    companyIds.forEach(id => currentIds.add(id));
    groupCompanies[groupId] = Array.from(currentIds);
    
    // Update company count
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      group.companiesCount = groupCompanies[groupId].length;
    }
  },

  removeCompany: async (groupId: string, companyId: string): Promise<void> => {
    await delay(500);
    if (!groupCompanies[groupId]) return;
    
    groupCompanies[groupId] = groupCompanies[groupId].filter(id => id !== companyId);
    
    // Update company count
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      group.companiesCount = groupCompanies[groupId].length;
    }
  },
};

export const mockCompanyApi = {
  getFollowed: async (): Promise<Company[]> => {
    await delay(500);
    return mockCompanies;
  },
};