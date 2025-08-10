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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* VAT Number Search */}
      <VatNumberInput
        value={filters.vatNumber}
        onChange={(value) => onFilterChange('vatNumber', value)}
        onSearch={onSearch}
        isSearching={isSearching}
      />

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Clear Filters Button */}
      <ClearFiltersButton onClick={handleClearFilters} />
    </div>
  );
};

const ClearFiltersButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="flex justify-end">
    <button
      onClick={onClick}
      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
    >
      Effacer les filtres
    </button>
  </div>
);

export default SearchForm;