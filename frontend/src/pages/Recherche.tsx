import React, { useState } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { SearchForm, SearchResults, RecentSearches } from '../components/recherche';
import { companyApi, recentSearchApi } from '../services/api';
import type { Company } from '../types/api';

interface SearchFilters {
  vatNumber: string;
  companyType: string;
  status: string;
  region: string;
}

const RechercheContent: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    vatNumber: '',
    companyType: '',
    status: '',
    region: '',
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    if (!filters.vatNumber.trim()) {
      alert('Veuillez entrer un numéro de TVA');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const results = await companyApi.search(filters);
      setSearchResults(results);
      
      // Add to recent searches if we have results
      if (results.length > 0) {
        const firstResult = results[0];
        await recentSearchApi.add({
          name: firstResult.name,
          vat: firstResult.vat
        });
      }
    } catch (error) {
      // Handle search error
      alert('Erreur lors de la recherche d\'entreprises');
    } finally {
      setIsSearching(false);
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

          {/* Recent Searches */}
          <div className="mt-8 mb-8">
            <RecentSearches />
          </div>

          {/* Search Results */}
          {hasSearched && (
            <SearchResults 
              isSearching={isSearching} 
              searchResults={searchResults}
            />
          )}
    </MainContentLayout>
  );
};

const Recherche: React.FC = () => {
  return <RechercheContent />;
};

export default Recherche;