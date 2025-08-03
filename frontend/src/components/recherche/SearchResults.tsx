import React from 'react';

interface SearchResultsProps {
  isSearching: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ isSearching }) => {
  if (!isSearching) return null;

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
};

export default SearchResults;