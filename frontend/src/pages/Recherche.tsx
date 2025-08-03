import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';

// Company types from AI schema
const companyTypes = [
  { value: 'private-company', label: 'Société privée' },
  { value: 'public-company', label: 'Société publique' },
  { value: 'self-employed', label: 'Indépendant' },
  { value: 'for-profit', label: 'À but lucratif' },
  { value: 'non-profit', label: 'Sans but lucratif' },
  { value: 'educational-institution', label: 'Institution éducative' },
  { value: 'research-organization', label: 'Organisation de recherche' },
  { value: 'startup', label: 'Startup' },
];

const companyStatuses = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

interface SearchFilters {
  vatNumber: string;
  companyType: string;
  status: string;
  region: string;
}

const RechercheContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [filters, setFilters] = useState<SearchFilters>({
    vatNumber: '',
    companyType: '',
    status: '',
    region: '',
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    if (!filters.vatNumber.trim()) {
      alert('Veuillez entrer un numéro de TVA');
      return;
    }

    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false);
      // Here would be the actual search implementation
      console.log('Recherche avec filtres:', filters);
    }, 2000);
  };

  const clearFilters = () => {
    setFilters({
      vatNumber: '',
      companyType: '',
      status: '',
      region: '',
    });
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
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recherche d'entreprises
          </h1>
          <p className="text-gray-600">
            Recherchez des entreprises belges par numéro de TVA et affinez vos résultats avec nos filtres
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* VAT Number Search */}
          <div className="mb-6">
            <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de TVA *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="vatNumber"
                value={filters.vatNumber}
                onChange={(e) => handleFilterChange('vatNumber', e.target.value)}
                placeholder="Ex: BE0123456789 ou 0123456789"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !filters.vatNumber.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Recherche...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Rechercher
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Company Type Filter */}
            <div>
              <label htmlFor="companyType" className="block text-sm font-medium text-gray-700 mb-2">
                Type d'entreprise
              </label>
              <select
                id="companyType"
                value={filters.companyType}
                onChange={(e) => handleFilterChange('companyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                {companyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                {companyStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                Région
              </label>
              <select
                id="region"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les régions</option>
                <option value="flanders">Flandre</option>
                <option value="wallonia">Wallonie</option>
                <option value="brussels">Bruxelles-Capitale</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Effacer les filtres
            </button>
          </div>
        </div>

        {/* Search Results Placeholder */}
        {isSearching && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <p className="text-gray-600">Recherche en cours...</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const Recherche: React.FC = () => {
  return <RechercheContent />;
};

export default Recherche;