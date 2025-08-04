import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Company } from '../../types/api';

interface SearchResultsProps {
  isSearching: boolean;
  searchResults: Company[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ isSearching, searchResults }) => {
  const navigate = useNavigate();

  if (isSearching) {
    return (
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
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
          <p className="text-gray-600">Aucune entreprise ne correspond à votre recherche</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
              <p className="text-sm text-gray-600">{company.legalForm}</p>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600 font-mono">{company.vat}</p>
              {company.sector && (
                <p className="text-sm text-gray-600">{company.sector}</p>
              )}
              {company.city && (
                <p className="text-sm text-gray-600">{company.city}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                company.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="5" />
                </svg>
                {company.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              {company.employees && (
                <span className="text-sm text-gray-600">
                  {company.employees} employé{company.employees > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <button 
              onClick={() => navigate(`/company/${company.id}`, { state: { from: 'Recherche', route: '/recherche' } })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Voir détails
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;