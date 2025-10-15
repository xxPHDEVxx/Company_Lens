import { useState, useEffect } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { SearchForm, SearchResults, RecentSearches } from '../components/recherche';
import { useCompanySearch, useAddRecentSearch } from '../hooks/queries';
import { validateAndNormalizeVat } from '../utils/vatValidation';

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
  const [vatError, setVatError] = useState<string>('');

  // Use React Query hooks
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isFetching,
    fetchStatus,
    fetchMessage,
    pollingError,
    clearPollingError
  } = useCompanySearch(filters, searchEnabled);
  const addRecentSearchMutation = useAddRecentSearch();

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchEnabled(false); // Disable auto-search when filters change

    // Clear VAT error when user changes the VAT number
    if (key === 'vatNumber') {
      setVatError('');
    }
  };

  const handleSearch = () => {
    // Validate VAT number
    const validation = validateAndNormalizeVat(filters.vatNumber);

    if (!validation.isValid) {
      setVatError(validation.error || 'Format de TVA invalide');
      return;
    }

    // Clear error and use normalized VAT for search
    setVatError('');
    setFilters(prev => ({ ...prev, vatNumber: validation.normalized || prev.vatNumber }));
    setHasSearched(true);
    setSearchEnabled(true); // Enable the query
  };

  // Add to recent searches when we get results
  useEffect(() => {
    if (searchEnabled && searchResults?.length > 0 && !isSearching) {
      const firstResult = searchResults[0];
      // Only save if we have all required fields
      if (firstResult?.name && firstResult?.vat && firstResult?.id) {
        addRecentSearchMutation.mutate({
          name: firstResult.name,
          vat: firstResult.vat,
          company_id: firstResult.id
        });
      } else {
        // Log warning if company ID is missing
        console.warn('Cannot save recent search - missing company ID:', {
          name: firstResult?.name,
          vat: firstResult?.vat,
          id: firstResult?.id
        });
      }
    }
  }, [searchResults, searchEnabled, isSearching]);


  return (
    <MainContentLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 sm:p-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Recherche d'entreprises
            </h1>
            <p className="text-sm sm:text-base text-green-100">
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
        vatError={vatError}
      />

      {/* Search Results */}
      {hasSearched && (
        <SearchResults
          isSearching={isFetching}
          searchResults={searchResults}
          fetchStatus={fetchStatus}
          fetchMessage={fetchMessage}
          pollingError={pollingError}
          onClearPollingError={clearPollingError}
        />
      )}

      {/* Recent Searches */}
      <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
        <RecentSearches />
      </div>
    </MainContentLayout>
  );
};

const Recherche = () => {
  return <RechercheContent />;
};

export default Recherche;