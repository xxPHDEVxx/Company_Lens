import type { ReactElement } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  activeColor: string;
  iconHoverColor: string;
  indicatorColor: string;
  icon: ReactElement;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    route: '/dashboard',
    activeColor: 'bg-blue-600/20 text-blue-400 border-blue-500',
    iconHoverColor: 'group-hover:text-blue-400',
    indicatorColor: 'bg-blue-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v6m8-6v6" />
      </svg>
    ),
  },
  {
    id: 'recherche',
    label: 'Recherche',
    route: '/recherche',
    activeColor: 'bg-emerald-600/20 text-emerald-400 border-emerald-500',
    iconHoverColor: 'group-hover:text-emerald-400',
    indicatorColor: 'bg-emerald-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'groupes',
    label: 'Groupes',
    route: '/groupes',
    activeColor: 'bg-purple-600/20 text-purple-400 border-purple-500',
    iconHoverColor: 'group-hover:text-purple-400',
    indicatorColor: 'bg-purple-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'suivi',
    label: 'Suivi',
    route: '/suivi',
    activeColor: 'bg-orange-600/20 text-orange-400 border-orange-500',
    iconHoverColor: 'group-hover:text-orange-400',
    indicatorColor: 'bg-orange-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    id: 'historique',
    label: 'Historique',
    route: '/historique',
    activeColor: 'bg-gray-600/20 text-gray-400 border-gray-500',
    iconHoverColor: 'group-hover:text-gray-400',
    indicatorColor: 'bg-gray-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const getActiveItem = (pathname: string): string => {
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/recherche') return 'recherche';
  if (pathname.startsWith('/groupes')) return 'groupes';
  if (pathname === '/suivi' || pathname.startsWith('/company/')) return 'suivi';
  if (pathname === '/historique') return 'historique';
  return 'dashboard';
};