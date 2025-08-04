import type { RecentSearch } from '../../types/api';

// Mock recent searches database
export const recentSearchesDb: RecentSearch[] = [
  { 
    id: '1',
    name: 'Delhaize Group', 
    vat: 'BE 0402.206.045', 
    time: 'Il y a 2 heures', 
    color: 'from-blue-500 to-blue-600' 
  },
  { 
    id: '2',
    name: 'Proximus', 
    vat: 'BE 0202.239.951', 
    time: 'Il y a 5 heures', 
    color: 'from-emerald-500 to-emerald-600' 
  },
  { 
    id: '3',
    name: 'KBC Bank', 
    vat: 'BE 0462.920.226', 
    time: 'Il y a 1 jour', 
    color: 'from-purple-500 to-purple-600' 
  },
  { 
    id: '4',
    name: 'Solvay', 
    vat: 'BE 0403.091.220', 
    time: 'Il y a 2 jours', 
    color: 'from-orange-500 to-orange-600' 
  },
  { 
    id: '5',
    name: 'AB InBev', 
    vat: 'BE 0417.497.106', 
    time: 'Il y a 3 jours', 
    color: 'from-pink-500 to-pink-600' 
  },
];