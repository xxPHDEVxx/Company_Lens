import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';

interface CompanyGroup {
  id: string;
  name: string;
  description: string;
  companiesCount: number;
  createdAt: string;
  color: string;
}

// Mock data for company groups
const mockGroups: CompanyGroup[] = [
  {
    id: '1',
    name: 'Concurrents principaux',
    description: 'Entreprises concurrentes directes dans notre secteur d\'activité',
    companiesCount: 12,
    createdAt: '2024-01-15',
    color: 'red',
  },
  {
    id: '2',
    name: 'Partenaires stratégiques',
    description: 'Entreprises partenaires pour des collaborations et projets communs',
    companiesCount: 8,
    createdAt: '2024-02-03',
    color: 'blue',
  },
  {
    id: '3',
    name: 'Fournisseurs clés',
    description: 'Principaux fournisseurs et prestataires de services',
    companiesCount: 15,
    createdAt: '2024-02-20',
    color: 'green',
  },
  {
    id: '4',
    name: 'Clients potentiels',
    description: 'Entreprises identifiées comme prospects pour nos services',
    companiesCount: 24,
    createdAt: '2024-03-01',
    color: 'purple',
  },
];

const colorClasses = {
  red: {
    bg: 'bg-red-100',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    button: 'hover:bg-red-50',
  },
  blue: {
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    button: 'hover:bg-blue-50',
  },
  green: {
    bg: 'bg-green-100',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    button: 'hover:bg-green-50',
  },
  purple: {
    bg: 'bg-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: 'text-purple-600',
    button: 'hover:bg-purple-50',
  },
};

const GroupesContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [groups, setGroups] = useState<CompanyGroup[]>(mockGroups);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    color: 'blue',
  });

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;

    const group: CompanyGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      companiesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      color: newGroup.color,
    };

    setGroups(prev => [...prev, group]);
    setNewGroup({ name: '', description: '', color: 'blue' });
    setShowNewGroupForm(false);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      setGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Dynamic left margin based on sidebar state */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:pl-32' : 'md:pl-72'
      } pr-4 md:pr-8 lg:pr-12 py-8`}>
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes groupes d'entreprises
            </h1>
            <p className="text-gray-600">
              Organisez et gérez vos entreprises en groupes thématiques
            </p>
          </div>
          <button
            onClick={() => setShowNewGroupForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau groupe
          </button>
        </div>

        {/* New Group Form */}
        {showNewGroupForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Créer un nouveau groupe
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du groupe *
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Concurrents principaux"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="groupDescription"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du groupe..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="groupColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
                  </label>
                  <select
                    id="groupColor"
                    value={newGroup.color}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="blue">Bleu</option>
                    <option value="red">Rouge</option>
                    <option value="green">Vert</option>
                    <option value="purple">Violet</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewGroupForm(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroup.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun groupe créé</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier groupe d'entreprises</p>
            <button
              onClick={() => setShowNewGroupForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Créer un groupe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const colors = colorClasses[group.color as keyof typeof colorClasses];
              return (
                <div
                  key={group.id}
                  className={`${colors.bg} ${colors.border} border rounded-xl p-6 hover:shadow-lg transition-all duration-200`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${colors.bg} border-2 ${colors.border} rounded-full`}></div>
                      <h3 className={`font-semibold ${colors.text} text-lg`}>
                        {group.name}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button className={`p-1 rounded ${colors.button} transition-colors duration-200`}>
                        <svg className={`w-4 h-4 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className={`p-1 rounded ${colors.button} transition-colors duration-200`}
                      >
                        <svg className={`w-4 h-4 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`${colors.text} text-sm mb-4 line-clamp-2`}>
                    {group.description}
                  </p>

                  {/* Stats */}
                  <div className={`${colors.text} text-sm space-y-2`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{group.companiesCount} entreprise{group.companiesCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Créé le {formatDate(group.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className={`w-full px-4 py-2 ${colors.text} border ${colors.border} rounded-lg ${colors.button} transition-colors duration-200 text-sm font-medium`}>
                      Voir les entreprises
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const Groupes: React.FC = () => {
  return (
    <SidebarProvider>
      <GroupesContent />
    </SidebarProvider>
  );
};

export default Groupes;