import { useNavigate } from 'react-router-dom';
import { useRecentSearches } from '../../hooks/queries';

const RecentSearches = () => {
  const navigate = useNavigate();
  const { data: recentSearches = [], isLoading } = useRecentSearches();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recherches récentes</h2>
          <p className="text-sm text-gray-600 mt-1">Vos dernières analyses d'entreprises</p>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Only show the 5 most recent searches
  const displayedSearches = recentSearches.slice(0, 5);

  const handleSearchClick = (companyId: string, vat: string) => {
    // Use company ID if available, fallback to VAT number without 'BE' prefix
    if (companyId && companyId.trim()) {
      navigate(`/company/${companyId}`, {
        state: { 
          from: 'Recherche', 
          route: '/recherche'
        }
      });
    } else if (vat) {
      // Fallback: try using VAT as ID (remove BE prefix)
      const cleanVat = vat.replace(/^BE/, '');
      console.warn('Using VAT as fallback ID:', cleanVat);
      navigate(`/company/${cleanVat}`, {
        state: { 
          from: 'Recherche', 
          route: '/recherche'
        }
      });
    } else {
      console.error('Cannot navigate - no company ID or VAT available');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recherches récentes</h2>
        <p className="text-sm text-gray-600 mt-1">Vos 5 dernières analyses d'entreprises</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {displayedSearches.map((search, index) => (
            <div 
              key={search.id || index} 
              onClick={() => handleSearchClick(search.company_id, search.vat)}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{search.name}</h3>
                  <p className="text-sm text-gray-600">{search.vat}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {search.time ? new Date(search.time).toLocaleString('fr-BE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }) : ''}
              </div>
            </div>
          ))}
        </div>
        
        {recentSearches.length > 5 && (
          <div className="mt-6 text-center">
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              Voir tout l'historique ({recentSearches.length} recherches) →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSearches;