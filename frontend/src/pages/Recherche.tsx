import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { SearchForm, SearchResults } from '../components/recherche';

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


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Fixed centered layout with equal spacing */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:ml-28' : 'md:ml-64'
      }`}>
        <div className="px-6 md:px-8 lg:px-12 pt-20 pb-8 max-w-6xl mx-auto">
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
          <SearchResults isSearching={isSearching} />
        </div>
      </div>
    </div>
  );
};

const Recherche: React.FC = () => {
  return <RechercheContent />;
};

export default Recherche;