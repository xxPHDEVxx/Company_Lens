import { useNavigate } from 'react-router-dom';
import type { Company } from '../../types/api';

interface SearchResultsProps {
  isSearching: boolean;
  searchResults: Company[];
  fetchStatus?: string | null;
  fetchMessage?: string;
}

const SearchResults = ({ isSearching, searchResults, fetchStatus, fetchMessage }: SearchResultsProps) => {
  const navigate = useNavigate();

  if (isSearching) {
    return (
      <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p className="text-sm sm:text-base text-gray-600">
              {fetchStatus === 'pending'
                ? 'Recherche en cours via notre IA...'
                : 'Recherche en cours...'}
            </p>
            {fetchMessage && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center max-w-md">
                {fetchMessage}
              </p>
            )}
            {fetchStatus === 'pending' && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center max-w-md">
                Cette entreprise n'est pas encore dans notre base. Nous la recherchons pour vous...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="text-center py-6 sm:py-8">
          <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
          <p className="text-sm sm:text-base text-gray-600">Aucune entreprise ne correspond à votre recherche</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900">
        {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {searchResults.map((company) => (
          <div key={company.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 break-words">{company.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{company.legalForm}</p>
            </div>

            <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 font-mono break-all">{company.vat}</p>
              {company.sector && (
                <p className="text-xs sm:text-sm text-gray-600 truncate">{company.sector}</p>
              )}
              {company.city && (
                <p className="text-xs sm:text-sm text-gray-600 truncate">{company.city}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                company.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="5" />
                </svg>
                {company.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              {company.employees && (
                <span className="text-xs sm:text-sm text-gray-600 truncate ml-2">
                  {company.employees} employé{company.employees > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate(`/company/${company.id}`, { state: { from: 'Recherche', route: '/recherche' } })}
              className="w-full px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm font-medium"
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