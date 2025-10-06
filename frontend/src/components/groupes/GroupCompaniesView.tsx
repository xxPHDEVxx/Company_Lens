import React, { useState, useCallback } from 'react';
import { X, Trash2, Plus, Building2, Eye, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ConfirmationModal from '../common/ConfirmationModal';
import SearchBar from '../common/SearchBar';
import { ToastContainer } from '../common/Toast';
import { useToast } from '../../hooks/useToast';
import { groupApi } from '../../services/api';
import type { Company, CompanyGroup } from '../../types/api';

interface GroupCompaniesViewProps {
  group: CompanyGroup;
  companies: Company[];
  availableCompanies: Company[];
  onBack: () => void;
  onDeleteCompany: (groupId: string, companyId: string) => void;
  onAddCompanies: (groupId: string, companyIds: string[]) => void;
  getGroupIcon: (iconKey?: string) => React.ReactNode;
}

// Sortable Company Card Component
interface SortableCompanyCardProps {
  company: Company;
  onDelete: (companyId: string) => void;
  onView: (companyId: string) => void;
}

function SortableCompanyCard({ company, onDelete, onView }: SortableCompanyCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow ${
        isDragging ? 'opacity-50 shadow-2xl z-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none flex-shrink-0"
            title="Glisser pour réorganiser"
          >
            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
        </div>
        <button
          onClick={() => onDelete(company.id)}
          className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="Retirer du groupe"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 break-words">{company.name}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 break-all">TVA: {company.vat}</p>
      {company.activities?.sectors && company.activities.sectors.length > 0 && (
        <p className="text-xs sm:text-sm text-gray-500 mb-1 truncate">Secteur: {company.activities.sectors[0]}</p>
      )}
      {company.city && (
        <p className="text-xs sm:text-sm text-gray-500 truncate">Localisation: {company.city}</p>
      )}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
        <button
          onClick={() => onView(company.id)}
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
        >
          <Eye className="w-4 h-4 flex-shrink-0" />
          Voir détails
        </button>
      </div>
    </div>
  );
}

const GroupCompaniesView: React.FC<GroupCompaniesViewProps> = ({
  group,
  companies,
  availableCompanies,
  onDeleteCompany,
  onAddCompanies,
}) => {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedCompanies, setSortedCompanies] = useState(companies);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; companyId: string | null }>({
    isOpen: false,
    companyId: null,
  });

  // Update sorted companies when companies prop changes
  React.useEffect(() => {
    setSortedCompanies(companies);
  }, [companies]);

  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      setSortedCompanies((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          
          // Update positions in backend
          const companyIds = newOrder.map(c => c.id);
          groupApi.updatePositions(group.id, companyIds)
            .then(() => {
              success('Ordre des entreprises mis à jour');
            })
            .catch(() => {
              showError('Erreur lors de la mise à jour de l\'ordre');
              // Revert on error
              setSortedCompanies(companies);
            });
          
          return newOrder;
        }
        return items;
      });
    }
  }, [group.id, companies, success, showError]);

  // Filter companies that are not already in the group
  const companiesNotInGroup = availableCompanies.filter(
    (company) => !companies.some((c) => c.id === company.id)
  );

  // Filter available companies based on search term
  const filteredCompanies = companiesNotInGroup.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.vat || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCompany = (companyId: string) => {
    setDeleteConfirmation({ isOpen: true, companyId });
  };

  const confirmDeleteCompany = async () => {
    if (!deleteConfirmation.companyId) return;
    
    try {
      await onDeleteCompany(group.id, deleteConfirmation.companyId);
      success('Entreprise retirée du groupe avec succès');
      setDeleteConfirmation({ isOpen: false, companyId: null });
    } catch (err) {
      showError('Erreur lors de la suppression de l\'entreprise du groupe');
    }
  };
  
  const handleViewCompanyDetails = (companyId: string) => {
    navigate(`/company/${companyId}`, {
      state: { 
        from: 'Groupes', 
        route: `/groupes/${group.id}`,
        groupName: group.name 
      }
    });
  };

  const handleAddCompanies = async () => {
    if (selectedCompanies.length > 0) {
      try {
        await onAddCompanies(group.id, selectedCompanies);
        success(`${selectedCompanies.length} entreprise${selectedCompanies.length > 1 ? 's ajoutées' : ' ajoutée'} au groupe`);
        setSelectedCompanies([]);
        setShowAddModal(false);
        setSearchTerm('');
      } catch (err) {
        showError('Erreur lors de l\'ajout des entreprises au groupe');
      }
    }
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="text-sm sm:text-base text-gray-600">
          <span className="font-medium">{sortedCompanies.length}</span> entreprise{sortedCompanies.length !== 1 ? 's' : ''} dans ce groupe
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-xs sm:text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          Ajouter une entreprise
        </button>
      </div>

      {/* Companies List with Drag and Drop */}
      {sortedCompanies.length === 0 ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-md">
          <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-500 mb-4">Aucune entreprise dans ce groupe</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium"
          >
            Ajouter des entreprises
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedCompanies}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedCompanies.map((company) => (
                <SortableCompanyCard
                  key={company.id}
                  company={company}
                  onDelete={handleDeleteCompany}
                  onView={handleViewCompanyDetails}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Companies Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold">Ajouter des entreprises</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCompanies([]);
                    setSearchTerm('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Search */}
              <div className="mb-4">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Rechercher par nom ou numéro TVA..."
                />
              </div>

              {/* Companies List */}
              <div className="space-y-2">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                    {searchTerm
                      ? 'Aucune entreprise trouvée'
                      : 'Toutes les entreprises sont déjà dans ce groupe'}
                  </div>
                ) : (
                  filteredCompanies.map((company) => (
                    <label
                      key={company.id}
                      className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => toggleCompanySelection(company.id)}
                        className="mr-3 mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base text-gray-900 break-words">{company.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 break-all">TVA: {company.vat || 'N/A'}</div>
                        {company.activities?.sectors && company.activities.sectors.length > 0 && (
                          <div className="text-xs sm:text-sm text-gray-500 truncate">{company.activities.sectors[0]}</div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 flex-shrink-0">
              <div className="text-xs sm:text-sm text-gray-600">
                {selectedCompanies.length} entreprise{selectedCompanies.length !== 1 ? 's' : ''} sélectionnée{selectedCompanies.length !== 1 ? 's' : ''}
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCompanies([]);
                    setSearchTerm('');
                  }}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddCompanies}
                  disabled={selectedCompanies.length === 0}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                    selectedCompanies.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, companyId: null })}
        onConfirm={confirmDeleteCompany}
        title="Retirer l'entreprise"
        message="Êtes-vous sûr de vouloir retirer cette entreprise du groupe ?"
        confirmText="Retirer"
        cancelText="Annuler"
        variant="warning"
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default GroupCompaniesView;