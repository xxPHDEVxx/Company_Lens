import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { GroupCompaniesView, getGroupIcon } from '../components/groupes';
import { groupApi, companyApi } from '../services/api';
import type { Company, CompanyGroup } from '../types/api';


const GroupDetailsContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [currentGroup, setCurrentGroup] = useState<CompanyGroup | null>(null);
  const [groupCompanies, setGroupCompanies] = useState<Company[]>([]);
  const [followedCompanies, setFollowedCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId) {
        navigate('/groupes');
        return;
      }

      try {
        setLoading(true);
        // Fetch group details
        const group = await groupApi.getById(groupId);
        setCurrentGroup(group);

        // Fetch companies in this group
        const companiesInGroup = await groupApi.getCompanies(groupId);
        setGroupCompanies(companiesInGroup);

        // Fetch all followed companies (for adding to group)
        const allFollowed = await companyApi.getFollowed();
        setFollowedCompanies(allFollowed);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, navigate]);

  const handleDeleteCompanyFromGroup = async (groupId: string, companyId: string) => {
    try {
      await groupApi.removeCompany(groupId, companyId);
      setGroupCompanies(prev => prev.filter(company => company.id !== companyId));
      if (currentGroup) {
        setCurrentGroup({
          ...currentGroup,
          companiesCount: Math.max(0, currentGroup.companiesCount - 1)
        });
      }
    } catch (err) {
      alert('Erreur lors de la suppression de l\'entreprise du groupe');
    }
  };

  const handleAddCompaniesToGroup = async (groupId: string, companyIds: string[]) => {
    try {
      await groupApi.addCompanies(groupId, companyIds);
      // Refresh the companies in group
      const updatedCompanies = await groupApi.getCompanies(groupId);
      setGroupCompanies(updatedCompanies);
      if (currentGroup) {
        setCurrentGroup({
          ...currentGroup,
          companiesCount: updatedCompanies.length
        });
      }
    } catch (err) {
      alert('Erreur lors de l\'ajout des entreprises au groupe');
    }
  };

  const handleBack = () => {
    navigate('/groupes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <div className={`transition-all duration-300 ${
          isCollapsed ? 'md:ml-28' : 'md:ml-64'
        }`}>
          <div className="px-6 md:px-8 lg:px-12 pt-20 pb-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Chargement du groupe...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <div className={`transition-all duration-300 ${
          isCollapsed ? 'md:ml-28' : 'md:ml-64'
        }`}>
          <div className="px-6 md:px-8 lg:px-12 pt-20 pb-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-600">{error || 'Groupe introuvable'}</p>
                <button
                  onClick={() => navigate('/groupes')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retour aux groupes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <GroupCompaniesView
            group={currentGroup}
            companies={groupCompanies}
            followedCompanies={followedCompanies}
            onBack={handleBack}
            onDeleteCompany={handleDeleteCompanyFromGroup}
            onAddCompanies={handleAddCompaniesToGroup}
            getGroupIcon={getGroupIcon}
          />
        </div>
      </div>
    </div>
  );
};

const GroupDetails: React.FC = () => {
  return <GroupDetailsContent />;
};

export default GroupDetails;