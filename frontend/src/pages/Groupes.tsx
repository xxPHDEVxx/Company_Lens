import { useState } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { GroupForm, GroupList, getGroupIcon, groupIcons } from '../components/groupes';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '../hooks/queries';
import type { CompanyGroup } from '../types/api';

const GroupesContent = () => {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<CompanyGroup | null>(null);

  // Use React Query hooks
  const { data: groups = [], isLoading, error } = useGroups();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const handleSubmitGroup = async (formData: { name: string; description: string; icon: string }) => {
    if (!formData.name.trim()) return;

    try {
      if (formMode === 'create') {
        await createGroupMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
        });
      } else if (formMode === 'edit' && editingGroup) {
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id,
          updates: {
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
          },
        });
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
        await deleteGroupMutation.mutateAsync(groupId);
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
          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Chargement des groupes...</p>
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
                <p className="text-gray-600">{error instanceof Error ? error.message : 'Erreur lors du chargement des groupes'}</p>
              </div>
            </div>
          )}

          {/* Groups Grid */}
          {!isLoading && !error && (
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