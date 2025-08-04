import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { GroupCompaniesView, getGroupIcon } from '../components/groupes';

interface CompanyGroup {
  id: string;
  name: string;
  description: string;
  companiesCount: number;
  createdAt: string;
  icon?: string;
}

interface Company {
  id: string;
  name: string;
  vatNumber: string;
  sector?: string;
  location?: string;
}

// Mock data for company groups (in a real app, this would come from an API)
const mockGroups: CompanyGroup[] = [
  {
    id: '1',
    name: 'Concurrents principaux',
    description: 'Entreprises concurrentes directes dans notre secteur d\'activité',
    companiesCount: 12,
    createdAt: '2024-01-15',
    icon: 'competitive',
  },
  {
    id: '2',
    name: 'Partenaires stratégiques',
    description: 'Entreprises partenaires pour des collaborations et projets communs',
    companiesCount: 8,
    createdAt: '2024-02-03',
    icon: 'partnership',
  },
  {
    id: '3',
    name: 'Fournisseurs clés',
    description: 'Principaux fournisseurs et prestataires de services',
    companiesCount: 15,
    createdAt: '2024-02-20',
    icon: 'supplier',
  },
  {
    id: '4',
    name: 'Clients potentiels',
    description: 'Entreprises identifiées comme prospects pour nos services',
    companiesCount: 24,
    createdAt: '2024-03-01',
    icon: 'client',
  },
];

// Mock data for companies (in a real app, this would come from an API)
const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp SA', vatNumber: 'BE0123456789', sector: 'Technologie', location: 'Bruxelles' },
  { id: '2', name: 'InnovateBE SPRL', vatNumber: 'BE0234567890', sector: 'Conseil', location: 'Liège' },
  { id: '3', name: 'GreenEnergy NV', vatNumber: 'BE0345678901', sector: 'Énergie', location: 'Anvers' },
  { id: '4', name: 'FinanceHub SA', vatNumber: 'BE0456789012', sector: 'Finance', location: 'Gand' },
  { id: '5', name: 'LogisTech BVBA', vatNumber: 'BE0567890123', sector: 'Logistique', location: 'Charleroi' },
  { id: '6', name: 'DataInsight SRL', vatNumber: 'BE0678901234', sector: 'Analyse de données', location: 'Namur' },
  { id: '7', name: 'CloudServices SA', vatNumber: 'BE0789012345', sector: 'Cloud Computing', location: 'Bruxelles' },
  { id: '8', name: 'SecureIT SPRL', vatNumber: 'BE0890123456', sector: 'Cybersécurité', location: 'Louvain' },
];

// Mock data for group-company relationships
const mockGroupCompanies: Record<string, string[]> = {
  '1': ['1', '2', '7'], // Concurrents principaux
  '2': ['3', '4'], // Partenaires stratégiques
  '3': ['5', '6', '8'], // Fournisseurs clés
  '4': [], // Clients potentiels (empty)
};

const GroupDetailsContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [groupCompanies, setGroupCompanies] = useState<Record<string, string[]>>(mockGroupCompanies);
  const [followedCompanies] = useState<Company[]>(mockCompanies);
  const [groups, setGroups] = useState<CompanyGroup[]>(mockGroups);

  // Find the current group
  const currentGroup = groups.find(g => g.id === groupId);

  // If group not found, redirect to groups page
  if (!currentGroup) {
    navigate('/groupes');
    return null;
  }

  const handleDeleteCompanyFromGroup = (groupId: string, companyId: string) => {
    setGroupCompanies(prev => ({
      ...prev,
      [groupId]: prev[groupId].filter(id => id !== companyId)
    }));
    
    // Update company count in the group
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, companiesCount: (groupCompanies[groupId]?.length || 1) - 1 }
        : group
    ));
  };

  const handleAddCompaniesToGroup = (groupId: string, companyIds: string[]) => {
    setGroupCompanies(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), ...companyIds]
    }));
    
    // Update company count in the group
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, companiesCount: (groupCompanies[groupId]?.length || 0) + companyIds.length }
        : group
    ));
  };

  const getCompaniesForGroup = (groupId: string): Company[] => {
    const companyIds = groupCompanies[groupId] || [];
    return followedCompanies.filter(company => companyIds.includes(company.id));
  };

  const handleBack = () => {
    navigate('/groupes');
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
          <GroupCompaniesView
            group={currentGroup}
            companies={getCompaniesForGroup(currentGroup.id)}
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