import { useState } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { SearchForm, SearchResults, RecentSearches } from '../components/recherche';
import { useCompanySearch, useAddRecentSearch } from '../hooks/queries';

interface SearchFilters {
  vatNumber: string;
  companyType: string;
  status: string;
  region: string;
}

const RechercheContent = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    vatNumber: '',
    companyType: '',
    status: '',
    region: '',
  });
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Use React Query hooks
  const { data: searchResults = [], isLoading: isSearching } = useCompanySearch(filters, searchEnabled);
  const addRecentSearchMutation = useAddRecentSearch();

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchEnabled(false); // Disable auto-search when filters change
  };

  const handleSearch = async () => {
    if (!filters.vatNumber.trim()) {
      alert('Veuillez entrer un numéro de TVA');
      return;
    }

    setHasSearched(true);
    setSearchEnabled(true); // Enable the query

    // Add to recent searches if we have results
    if (searchResults.length > 0) {
      const firstResult = searchResults[0];
      await addRecentSearchMutation.mutateAsync({
        name: firstResult.name,
        vat: firstResult.vat
      });
    }
  };


  return (
    <MainContentLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Recherche d'entreprises
            </h1>
            <p className="text-green-100">
              Recherchez des entreprises belges par numéro de TVA et affinez vos résultats avec nos filtres
            </p>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <SearchForm
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      {/* Search Results */}
      {hasSearched && (
        <SearchResults
          isSearching={isSearching}
          searchResults={searchResults}
        />
      )}

      {/* Recent Searches */}
      <div className="mt-8 mb-8">
        <RecentSearches />
      </div>
    </MainContentLayout>
  );
};

const Recherche = () => {
  return <RechercheContent />;
};

export default Recherche;