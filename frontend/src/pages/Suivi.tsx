import { useState } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { CompanyStats, CompanyFilters, CompanyList } from '../components/suivi';
import { useFollowedCompanies, useUnfollowCompany } from '../hooks/queries';
import type { Company } from '../types/api';

// Type for followed company (using Company type from API)
type FollowedCompany = Company;


const SuiviContent = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRegion, setFilterRegion] = useState<'all' | 'flanders' | 'wallonia' | 'brussels'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'followedSince' | 'lastUpdate'>('followedSince');

  // Use React Query hooks
  const { data: followedCompanies = [], isLoading, error } = useFollowedCompanies();
  const unfollowMutation = useUnfollowCompany();

  const handleUnfollow = async (companyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir arrêter de suivre cette entreprise ?')) {
      try {
        await unfollowMutation.mutateAsync(companyId);
      } catch (err) {
        alert('Erreur lors du désabonnement de l\'entreprise');
      }
    }
  };

  const filteredAndSortedCompanies = followedCompanies
    .filter(company => {
      if (filterStatus !== 'all' && company.status !== filterStatus) return false;
      if (filterRegion !== 'all' && company.region !== filterRegion) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'followedSince':
          return new Date(b.followedSince || '').getTime() - new Date(a.followedSince || '').getTime();
        case 'lastUpdate':
          return new Date(b.lastUpdate || '').getTime() - new Date(a.lastUpdate || '').getTime();
        default:
          return 0;
      }
    });


  return (
    <MainContentLayout>
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Entreprises suivies
                </h1>
                <p className="text-orange-100">
                  Surveillez l'évolution des entreprises qui vous intéressent
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                <p className="text-gray-600">Chargement des entreprises suivies...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-600">{error instanceof Error ? error.message : 'Erreur lors du chargement des entreprises suivies'}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!isLoading && !error && (
            <>
              {/* Filters and Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                {/* Stats */}
                <CompanyStats followedCompanies={followedCompanies} />

                {/* Filters */}
                <CompanyFilters
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  filterRegion={filterRegion}
                  setFilterRegion={setFilterRegion}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>

              {/* Companies List */}
              <CompanyList
                companies={filteredAndSortedCompanies}
                onUnfollow={handleUnfollow}
              />
            </>
          )}
    </MainContentLayout>
  );
};

const Suivi = () => {
  return <SuiviContent />;
};

export default Suivi;