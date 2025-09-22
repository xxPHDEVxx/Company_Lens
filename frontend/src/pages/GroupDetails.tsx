import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import GroupHeader from '../components/groupes/GroupHeader';
import GroupOverview from '../components/groupes/GroupOverview';
import GroupCompaniesView from '../components/groupes/GroupCompaniesView';
import GroupStatistics from '../components/groupes/GroupStatistics';
import { getGroupIcon } from '../components/groupes';
import { useGroup, useGroupCompanies, useCompanies, useRemoveCompanyFromGroup, useAddCompaniesToGroup } from '../hooks/queries';
import { queryKeys } from '../lib/queryClient';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Determine the source page from location state or default to 'Groupes'
  const sourcePage = location.state?.from || 'Groupes';
  const sourceRoute = location.state?.route || '/groupes';

  // Use React Query hooks
  const { data: group, isLoading: groupLoading, error: groupError, refetch: refetchGroup } = useGroup(groupId);
  const { data: companies = [], isLoading: companiesLoading, refetch: refetchCompanies } = useGroupCompanies(groupId);
  const { data: allCompanies = [] } = useCompanies();  // Fetch ALL companies for the modal
  const removeCompanyMutation = useRemoveCompanyFromGroup();
  const addCompaniesMutation = useAddCompaniesToGroup();

  const loading = groupLoading || companiesLoading;
  const error = groupError;

  const handleDeleteCompanyFromGroup = async (groupId: string, companyId: string) => {
    // Let it throw - the child component will handle the error display
    await removeCompanyMutation.mutateAsync({ groupId, companyId });
    // Manually refetch to ensure UI updates
    await refetchCompanies();
    await refetchGroup();
  };

  const handleAddCompaniesToGroup = async (groupId: string, companyIds: string[]) => {
    // Let it throw - the child component will handle the error display
    await addCompaniesMutation.mutateAsync({ groupId, companyIds });
    // Manually refetch to ensure UI updates
    await refetchCompanies();
    await refetchGroup();
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'companies', label: 'Entreprises' },
    { id: 'statistics', label: 'Statistiques' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(sourceRoute)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span>{sourcePage}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Chargement des données du groupe...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(sourceRoute)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span>{sourcePage}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600">{error instanceof Error ? error.message : 'Groupe introuvable'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(sourceRoute)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>{sourcePage}</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Star className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <GroupHeader 
          group={{
            ...group,
            companiesCount: companies.length, // Use actual companies array length for accurate count
            updatedAt: group.updatedAt || group.createdAt
          }} 
          getGroupIcon={getGroupIcon} 
        />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <GroupOverview group={group} companies={companies} />
          )}

          {activeTab === 'companies' && (
            <GroupCompaniesView
              group={group}
              companies={companies}
              availableCompanies={allCompanies}
              onBack={() => navigate('/groupes')}
              onDeleteCompany={handleDeleteCompanyFromGroup}
              onAddCompanies={handleAddCompaniesToGroup}
              getGroupIcon={getGroupIcon}
            />
          )}

          {activeTab === 'statistics' && (
            <GroupStatistics companies={companies} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;