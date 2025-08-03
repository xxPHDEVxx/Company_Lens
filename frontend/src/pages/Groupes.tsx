import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { GroupForm, GroupList, groupIcons, getGroupIcon } from '../components/groupes';

interface CompanyGroup {
  id: string;
  name: string;
  description: string;
  companiesCount: number;
  createdAt: string;
  icon?: string;
}

// Mock data for company groups
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


const GroupesContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [groups, setGroups] = useState<CompanyGroup[]>(mockGroups);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    icon: 'default',
  });

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;

    const group: CompanyGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      companiesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      icon: newGroup.icon,
    };

    setGroups(prev => [...prev, group]);
    setNewGroup({ name: '', description: '', icon: 'default' });
    setShowNewGroupForm(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      setGroups(prev => prev.filter(group => group.id !== groupId));
    }
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
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Mes groupes d'entreprises
                    </h1>
                    <p className="text-purple-100">
                      Organisez et gérez vos entreprises en groupes thématiques
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewGroupForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors duration-200 shadow-sm border border-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau groupe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* New Group Form */}
          {showNewGroupForm && (
            <GroupForm
              newGroup={newGroup}
              setNewGroup={setNewGroup}
              onSubmit={handleCreateGroup}
              onCancel={() => setShowNewGroupForm(false)}
              getGroupIcon={getGroupIcon}
              groupIcons={groupIcons}
            />
          )}

          {/* Groups Grid */}
          <GroupList
            groups={groups}
            onDeleteGroup={handleDeleteGroup}
            onShowNewGroupForm={() => setShowNewGroupForm(true)}
            getGroupIcon={getGroupIcon}
          />
        </div>
      </div>
    </div>
  );
};

const Groupes: React.FC = () => {
  return <GroupesContent />;
};

export default Groupes;