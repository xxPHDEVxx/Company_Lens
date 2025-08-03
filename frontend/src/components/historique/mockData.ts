import type { Activity } from './types';

// Mock activity data
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'recherche',
    title: 'Recherche d\'entreprise',
    description: 'Recherche effectuée pour le numéro TVA',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    details: {
      companyName: 'SNCB SA',
      vatNumber: 'BE0203430576',
    },
  },
  {
    id: '2',
    type: 'groupe',
    title: 'Création de groupe',
    description: 'Nouveau groupe créé',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    details: {
      groupName: 'Partenaires stratégiques',
      companiesCount: 8,
    },
  },
  {
    id: '3',
    type: 'suivi',
    title: 'Ajout au suivi',
    description: 'Entreprise ajoutée à la liste de suivi',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    details: {
      companyName: 'KBC Group NV',
      vatNumber: 'BE0403227515',
    },
  },
  {
    id: '4',
    type: 'recherche',
    title: 'Recherche d\'entreprise',
    description: 'Recherche effectuée pour le numéro TVA',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    details: {
      companyName: 'Proximus SA',
      vatNumber: 'BE0202239951',
    },
  },
  {
    id: '5',
    type: 'groupe',
    title: 'Modification de groupe',
    description: 'Groupe mis à jour',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    details: {
      groupName: 'Fournisseurs clés',
      companiesCount: 15,
    },
  },
];