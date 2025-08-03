import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';

interface FollowedCompany {
  id: string;
  name: string;
  vatNumber: string;
  legalForm: string;
  sector: string;
  city: string;
  region: 'flanders' | 'wallonia' | 'brussels';
  status: 'active' | 'inactive';
  followedSince: string;
  lastUpdate: string;
  employeeCount?: number;
  website?: string;
}

// Mock data for followed companies
const mockFollowedCompanies: FollowedCompany[] = [
  {
    id: '1',
    name: 'TechSolutions SPRL',
    vatNumber: 'BE0123456789',
    legalForm: 'SPRL',
    sector: 'Technologies de l\'information',
    city: 'Bruxelles',
    region: 'brussels',
    status: 'active',
    followedSince: '2024-01-15',
    lastUpdate: '2024-03-01',
    employeeCount: 25,
    website: 'https://techsolutions.be',
  },
  {
    id: '2',
    name: 'InnovateBelgium SA',
    vatNumber: 'BE0987654321',
    legalForm: 'SA',
    sector: 'Consulting',
    city: 'Gand',
    region: 'flanders',
    status: 'active',
    followedSince: '2024-02-03',
    lastUpdate: '2024-02-28',
    employeeCount: 50,
  },
  {
    id: '3',
    name: 'EcoServices ASBL',
    vatNumber: 'BE0555666777',
    legalForm: 'ASBL',
    sector: 'Environnement',
    city: 'Liège',
    region: 'wallonia',
    status: 'active',
    followedSince: '2024-02-20',
    lastUpdate: '2024-03-02',
    employeeCount: 12,
    website: 'https://ecoservices.be',
  },
  {
    id: '4',
    name: 'RetailPro SPRL',
    vatNumber: 'BE0444555666',
    legalForm: 'SPRL',
    sector: 'Commerce de détail',
    city: 'Anvers',
    region: 'flanders',
    status: 'inactive',
    followedSince: '2024-01-10',
    lastUpdate: '2024-02-15',
    employeeCount: 8,
  },
  {
    id: '5',
    name: 'DataAnalytics NV',
    vatNumber: 'BE0333444555',
    legalForm: 'NV',
    sector: 'Analyse de données',
    city: 'Louvain-la-Neuve',
    region: 'wallonia',
    status: 'active',
    followedSince: '2024-03-01',
    lastUpdate: '2024-03-05',
    employeeCount: 35,
    website: 'https://dataanalytics.be',
  },
  {
    id: '6',
    name: 'GreenEnergy Solutions',
    vatNumber: 'BE0222333444',
    legalForm: 'SA',
    sector: 'Énergies renouvelables',
    city: 'Bruges',
    region: 'flanders',
    status: 'active',
    followedSince: '2024-02-15',
    lastUpdate: '2024-03-03',
    employeeCount: 18,
  },
];

const regionLabels = {
  flanders: 'Flandre',
  wallonia: 'Wallonie',
  brussels: 'Bruxelles-Capitale',
};

const SuiviContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>(mockFollowedCompanies);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRegion, setFilterRegion] = useState<'all' | 'flanders' | 'wallonia' | 'brussels'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'followedSince' | 'lastUpdate'>('followedSince');

  const handleUnfollow = (companyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir arrêter de suivre cette entreprise ?')) {
      setFollowedCompanies(prev => prev.filter(company => company.id !== companyId));
    }
  };

  const filteredAndSortedCompanies = followedCompanies
    .filter(company => {
      if (filterStatus !== 'all' && company.status !== filterStatus) return false;
      if (filterRegion !== 'all' && company.region !== filterRegion) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'followedSince':
          return new Date(b.followedSince).getTime() - new Date(a.followedSince).getTime();
        case 'lastUpdate':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: 'active' | 'inactive') => {
    return status === 'active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactif
      </span>
    );
  };

  const getRegionBadge = (region: 'flanders' | 'wallonia' | 'brussels') => {
    const colors = {
      flanders: 'bg-yellow-100 text-yellow-800',
      wallonia: 'bg-red-100 text-red-800',
      brussels: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[region]}`}>
        {regionLabels[region]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Dynamic left margin based on sidebar state */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:pl-32' : 'md:pl-72'
      } pr-4 md:pr-8 lg:pr-12 py-8`}>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Entreprises suivies
          </h1>
          <p className="text-gray-600">
            Surveillez l'évolution des entreprises qui vous intéressent
          </p>
        </div>

        {/* Filters and Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{followedCompanies.length}</div>
              <div className="text-sm text-gray-600">Total suivi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {followedCompanies.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {followedCompanies.filter(c => c.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-600">Inactives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {followedCompanies.filter(c => {
                  const lastUpdate = new Date(c.lastUpdate);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return lastUpdate > weekAgo;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Mises à jour récentes</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            <div>
              <label htmlFor="regionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Région
              </label>
              <select
                id="regionFilter"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value as 'all' | 'flanders' | 'wallonia' | 'brussels')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les régions</option>
                <option value="flanders">Flandre</option>
                <option value="wallonia">Wallonie</option>
                <option value="brussels">Bruxelles-Capitale</option>
              </select>
            </div>

            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'followedSince' | 'lastUpdate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="followedSince">Date de suivi</option>
                <option value="lastUpdate">Dernière mise à jour</option>
                <option value="name">Nom alphabétique</option>
              </select>
            </div>
          </div>
        </div>

        {/* Companies List */}
        {filteredAndSortedCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
            <p className="text-gray-600 mb-4">Aucune entreprise ne correspond aux filtres sélectionnés</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-600">{company.legalForm}</p>
                  </div>
                  <button
                    onClick={() => handleUnfollow(company.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Arrêter de suivre"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* VAT and Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 font-mono">{company.vatNumber}</span>
                  {getStatusBadge(company.status)}
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="line-clamp-1">{company.sector}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{company.city}</span>
                  </div>
                  {company.employeeCount && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{company.employeeCount} employé{company.employeeCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Region Badge */}
                <div className="mb-4">
                  {getRegionBadge(company.region)}
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div>Suivi depuis: {formatDate(company.followedSince)}</div>
                  <div>Dernière mise à jour: {formatDate(company.lastUpdate)}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium">
                    Voir détails
                  </button>
                  {company.website && (
                    <button className="px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const Suivi: React.FC = () => {
  return <SuiviContent />;
};

export default Suivi;