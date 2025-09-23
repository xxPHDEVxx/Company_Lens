import { useQuery } from '@tanstack/react-query';
import { companyApi, groupApi, recentSearchApi } from '../../services/api';

const WelcomeSection = () => {
  // Fetch followed companies count
  const { data: followedCompanies } = useQuery({
    queryKey: ['companies', 'followed'],
    queryFn: () => companyApi.getFollowed(),
  });

  // Fetch groups count
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupApi.getAll(),
  });

  // Fetch recent searches
  const { data: recentSearches } = useQuery({
    queryKey: ['recentSearches'],
    queryFn: () => recentSearchApi.getAll(),
  });

  // Calculate statistics
  const followedCount = followedCompanies?.length || 0;
  const groupsCount = groups?.length || 0;
  const searchesCount = recentSearches?.length || 0;

  return (
    <div className="mb-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
        </div>
        <div className="p-8">
          {/* Statistics integrated into welcome section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Entreprises suivies */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {followedCount}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    {followedCount === 1 ? 'Entreprise suivie' : 'Entreprises suivies'}
                  </p>
                </div>
              </div>
            </div>
            {/* Recherches récentes */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchesCount}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    {searchesCount === 1 ? 'Recherche récente' : 'Recherches récentes'}
                  </p>
                </div>
              </div>
            </div>
            {/* Groupes créés */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {groupsCount}
                  </p>
                  <p className="text-sm font-medium text-gray-600">
                    {groupsCount === 1 ? 'Groupe créé' : 'Groupes créés'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;