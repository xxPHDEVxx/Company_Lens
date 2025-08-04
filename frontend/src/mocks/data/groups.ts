import type { CompanyGroup } from '../../types/api';

// Mock groups database
export const groupsDb: CompanyGroup[] = [
  {
    id: '1',
    name: 'Concurrents principaux',
    description: 'Entreprises concurrentes directes dans notre secteur d\'activité',
    companiesCount: 3,
    createdAt: '2024-01-15',
    icon: 'competitive',
  },
  {
    id: '2',
    name: 'Partenaires stratégiques',
    description: 'Entreprises partenaires pour des collaborations et projets communs',
    companiesCount: 2,
    createdAt: '2024-02-03',
    icon: 'partnership',
  },
  {
    id: '3',
    name: 'Fournisseurs clés',
    description: 'Principaux fournisseurs et prestataires de services',
    companiesCount: 3,
    createdAt: '2024-02-20',
    icon: 'supplier',
  },
  {
    id: '4',
    name: 'Clients potentiels',
    description: 'Entreprises identifiées comme prospects pour nos services',
    companiesCount: 0,
    createdAt: '2024-03-01',
    icon: 'client',
  },
];

// Mock group-company relationships
export const groupCompaniesDb: Record<string, string[]> = {
  '1': ['9', '10', '15'], // Concurrents principaux
  '2': ['11', '12'], // Partenaires stratégiques
  '3': ['13', '14', '16'], // Fournisseurs clés
  '4': [], // Clients potentiels (empty)
};