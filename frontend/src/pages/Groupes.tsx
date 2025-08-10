import { useState, useEffect } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { GroupForm, GroupList, getGroupIcon } from '../components/groupes';
import { groupApi } from '../services/api';
import type { CompanyGroup } from '../types/api';

const GroupesContent = () => {
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<CompanyGroup | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getAll();
      setGroups(data);
    } catch (err) {
      setError('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGroup = async (formData: { name: string; description: string; icon: string }) => {
    if (!formData.name.trim()) return;

    try {
      if (formMode === 'create') {
        const newGroup = await groupApi.create({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        setGroups(prev => [...prev, newGroup]);
      } else if (formMode === 'edit' && editingGroup) {
        const updatedGroup = await groupApi.update(editingGroup.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
        setGroups(prev => prev.map(group => 
          group.id === editingGroup.id ? updatedGroup : group
        ));
      }
      setShowGroupForm(false);
      setEditingGroup(null);
    } catch (err) {
      alert('Erreur lors de la sauvegarde du groupe');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await groupApi.delete(groupId);
        setGroups(prev => prev.filter(group => group.id !== groupId));
      } catch (err) {
        alert('Erreur lors de la suppression du groupe');
      }
    }
  };

  const handleEditGroup = (group: CompanyGroup) => {
    setEditingGroup(group);
    setFormMode('edit');
    setShowGroupForm(true);
  };

  const handleCreateNew = () => {
    setEditingGroup(null);
    setFormMode('create');
    setShowGroupForm(true);
  };


  return (
    <MainContentLayout>
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Mes groupes d'entreprises
                </h1>
                <p className="text-purple-100">
                  Organisez et gérez vos entreprises en groupes thématiques
                </p>
              </div>
            </div>
          </div>

          {/* New Group Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau groupe
            </button>
          </div>

          {/* Group Form */}
          {showGroupForm && (
            <GroupForm
              mode={formMode}
              initialData={editingGroup ? {
                name: editingGroup.name,
                description: editingGroup.description,
                icon: editingGroup.icon || 'default',
              } : undefined}
              onSubmit={handleSubmitGroup}
              onCancel={() => {
                setShowGroupForm(false);
                setEditingGroup(null);
              }}
              getGroupIcon={getGroupIcon}
              groupIcons={groupIcons}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Chargement des groupes...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="text-center">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {/* Groups Grid */}
          {!loading && !error && (
            <GroupList
              groups={groups}
              onDeleteGroup={handleDeleteGroup}
              onEditGroup={handleEditGroup}
              onShowNewGroupForm={handleCreateNew}
              getGroupIcon={getGroupIcon}
            />
          )}
    </MainContentLayout>
  );
};

const Groupes: React.FC = () => {
  return <GroupesContent />;
};

export default Groupes;