import React from 'react';
import { VatNumberInput, FilterSelect, companyTypes, companyStatuses, regions } from './search-form';

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

const SearchForm: React.FC<SearchFormProps> = ({
  filters,
  onFilterChange,
  onSearch,
  isSearching,
}) => {
  const handleClearFilters = () => {
    onFilterChange('vatNumber', '');
    onFilterChange('companyType', '');
    onFilterChange('status', '');
    onFilterChange('region', '');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
      {/* VAT Number Search */}
      <VatNumberInput
        value={filters.vatNumber}
        onChange={(value) => onFilterChange('vatNumber', value)}
        onSearch={onSearch}
        isSearching={isSearching}
      />

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <FilterSelect
          id="companyType"
          label="Type d'entreprise"
          value={filters.companyType}
          onChange={(value) => onFilterChange('companyType', value)}
          options={companyTypes}
          placeholder="Tous les types"
        />

        <FilterSelect
          id="status"
          label="Statut"
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={companyStatuses}
          placeholder="Tous les statuts"
        />

        <FilterSelect
          id="region"
          label="Région"
          value={filters.region}
          onChange={(value) => onFilterChange('region', value)}
          options={regions}
          placeholder="Toutes les régions"
        />
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <ClearFiltersButton
          onClick={handleClearFilters}
          hasFilters={!!filters.vatNumber || !!filters.companyType || !!filters.status || !!filters.region}
        />
        <div className="text-xs sm:text-sm text-gray-500">
          {(filters.vatNumber || filters.companyType || filters.status || filters.region) && (
            <span>Filtres actifs</span>
          )}
        </div>
      </div>
    </div>
  );
};

interface ClearFiltersButtonProps {
  onClick: () => void;
  hasFilters: boolean;
}

const ClearFiltersButton: React.FC<ClearFiltersButtonProps> = ({ onClick, hasFilters }) => (
  <button
    onClick={onClick}
    disabled={!hasFilters}
    className={`
      px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm
      ${hasFilters
        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
      }
    `}
  >
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
    <span className="whitespace-nowrap">Réinitialiser les filtres</span>
  </button>
);

export default SearchForm;