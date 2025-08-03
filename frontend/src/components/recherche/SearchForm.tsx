import React from 'react';

interface SearchFilters {
  vatNumber: string;
  companyType: string;
  status: string;
  region: string;
}

interface SearchFormProps {
  filters: SearchFilters;
  onFilterChange: (key: keyof SearchFilters, value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

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

const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFilterChange,
  onSearch,
  isSearching,
}) => {
  return (
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
            onChange={(e) => onFilterChange('vatNumber', e.target.value)}
            placeholder="Ex: BE0123456789 ou 0123456789"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={onSearch}
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
            onChange={(e) => onFilterChange('companyType', e.target.value)}
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
            onChange={(e) => onFilterChange('status', e.target.value)}
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
            onChange={(e) => onFilterChange('region', e.target.value)}
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
          onClick={() => {
            onFilterChange('vatNumber', '');
            onFilterChange('companyType', '');
            onFilterChange('status', '');
            onFilterChange('region', '');
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          Effacer les filtres
        </button>
      </div>
    </div>
  );
};

export default SearchForm;