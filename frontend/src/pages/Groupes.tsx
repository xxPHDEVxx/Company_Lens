import { useState } from 'react';
import { Search } from 'lucide-react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { GroupForm, GroupList, getGroupIcon, groupIcons } from '../components/groupes';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '../hooks/queries';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { ToastContainer } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import type { CompanyGroup } from '../types/api';

const GroupesContent = () => {
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<CompanyGroup | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; groupId: string | null }>({
    isOpen: false,
    groupId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Use toast notifications
  const { toasts, removeToast, success, error: showError } = useToast();

  // Use React Query hooks
  const { data: groups = [], isLoading, error } = useGroups();
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const handleSubmitGroup = async (formData: { name: string; description: string; icon: string }) => {
    if (!formData.name.trim()) return;

    console.log('Submitting group data:', formData);

    try {
      if (formMode === 'create') {
        const groupData = {
          name: formData.name,
          description: formData.description,
          icon: formData.icon || 'folder', // Ensure valid icon
        };
        console.log('Creating group with data:', groupData);
        await createGroupMutation.mutateAsync(groupData);
        success('Groupe créé avec succès');
      } else if (formMode === 'edit' && editingGroup) {
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id,
          updates: {
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            color: editingGroup.color || '#6366F1',
          },
        });
        success('Groupe modifié avec succès');
      }
      setShowGroupForm(false);
      setEditingGroup(null);
    } catch (err: any) {
      console.error('Group operation error:', err);
      
      // Extract error message from the backend response
      let errorMessage = formMode === 'create' 
        ? 'Erreur lors de la création du groupe' 
        : 'Erreur lors de la modification du groupe';
      
      if (err?.response?.data) {
        const data = err.response.data;
        console.log('Error response data:', data);
        
        // Check if the error is about duplicate name
        if (data.name && Array.isArray(data.name)) {
          errorMessage = data.name[0];
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.icon && Array.isArray(data.icon)) {
          errorMessage = data.icon[0];
        }
      }
      
      showError(errorMessage);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setDeleteConfirmation({ isOpen: true, groupId });
  };

  const confirmDeleteGroup = async () => {
    if (!deleteConfirmation.groupId) return;

    try {
      await deleteGroupMutation.mutateAsync(deleteConfirmation.groupId);
      success('Groupe supprimé avec succès');
      setDeleteConfirmation({ isOpen: false, groupId: null });
    } catch (err) {
      showError('Erreur lors de la suppression du groupe');
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

  // Filter groups (without sorting if no sortBy is selected)
  const filteredGroups = groups
    .filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

          {/* Search and Filter Bar */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un groupe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* New Group Button */}
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau groupe
              </button>
            </div>
            
            {/* Results Count */}
            {searchTerm && (
              <div className="mt-3 text-sm text-gray-600">
                {filteredGroups.length} groupe{filteredGroups.length !== 1 ? 's' : ''} trouvé{filteredGroups.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Group Form */}
          {showGroupForm && (
            <GroupForm
              mode={formMode}
              initialData={editingGroup ? {
                name: editingGroup.name,
                description: editingGroup.description,
                icon: editingGroup.icon || 'folder',
              } : undefined}
              onSubmit={handleSubmitGroup}
              onCancel={() => {
                setShowGroupForm(false);
                setEditingGroup(null);
              }}
              getGroupIcon={getGroupIcon}
              groupIcons={groupIcons}
              isLoading={createGroupMutation.isLoading || updateGroupMutation.isLoading}
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
              groups={filteredGroups}
              onDeleteGroup={handleDeleteGroup}
              onEditGroup={handleEditGroup}
              onShowNewGroupForm={handleCreateNew}
              getGroupIcon={getGroupIcon}
            />
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation({ isOpen: false, groupId: null })}
            onConfirm={confirmDeleteGroup}
            title="Supprimer le groupe"
            message="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
            confirmText="Supprimer"
            cancelText="Annuler"
            variant="danger"
            isLoading={deleteGroupMutation.isLoading}
          />

          {/* Toast Notifications */}
          <ToastContainer toasts={toasts} onRemove={removeToast} />
    </MainContentLayout>
  );
};

const Groupes: React.FC = () => {
  return <GroupesContent />;
};

export default Groupes;