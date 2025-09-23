import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../services/api';
import type { Company } from '../../types/api';

interface CompanyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

/**
 * Modal component for editing company information
 * Allows users to edit their company details except VAT number
 * Handles both snake_case (API) and camelCase (frontend) field names
 */
const CompanyEditModal = ({ isOpen, onClose, company }: CompanyEditModalProps) => {
  // Form state matching backend API expectations (snake_case)
  const [formData, setFormData] = useState({
    name: '',
    company_size: '',
    company_type: '',
    capital: 0,
    phone: '',
    email: '',
    website: '',
    activities: {
      main_activity: '',
      secondary_activities: [] as string[],
      nacebel_codes: [] as string[],
      description: '',
    },
  });

  // Temporary input states for adding new items
  const [newSecondaryActivity, setNewSecondaryActivity] = useState('');
  const [newNacebelCode, setNewNacebelCode] = useState('');

  const queryClient = useQueryClient();

  // Initialize form data when company prop changes
  useEffect(() => {
    setFormData({
      name: company.name || '',
      company_size: company.companySize || '',
      company_type: company.companyType || '',
      capital: parseFloat(company.capital?.replace(/[€,]/g, '') || '0'),
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      activities: {
        main_activity: company.activities?.primarySector || '',
        secondary_activities: company.activities?.companyActivities || [],
        nacebel_codes: company.activities?.nacebelCodes || [],
        description: company.activities?.description || '',
      },
    });
  }, [company]);

  // Mutation for updating company data
  const updateMutation = useMutation({
    mutationFn: authApi.updateUserCompany,
    onSuccess: async (updatedCompany) => {
      // Update cache and invalidate queries to ensure data consistency
      queryClient.setQueryData(['companies', 'detail', company.id], updatedCompany);
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user', 'company'] }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] }),
        queryClient.invalidateQueries({ queryKey: ['companies', 'detail', company.id] }),
        queryClient.invalidateQueries({ queryKey: ['companies', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['companies', 'followed'] }),
      ]);
      
      queryClient.refetchQueries({ queryKey: ['companies', 'detail', company.id] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addSecondaryActivity = () => {
    if (newSecondaryActivity.trim()) {
      setFormData({
        ...formData,
        activities: {
          ...formData.activities,
          secondary_activities: [...formData.activities.secondary_activities, newSecondaryActivity.trim()]
        }
      });
      setNewSecondaryActivity('');
    }
  };

  const removeSecondaryActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: {
        ...formData.activities,
        secondary_activities: formData.activities.secondary_activities.filter((_, i) => i !== index)
      }
    });
  };

  const addNacebelCode = () => {
    if (newNacebelCode.trim()) {
      setFormData({
        ...formData,
        activities: {
          ...formData.activities,
          nacebel_codes: [...formData.activities.nacebel_codes, newNacebelCode.trim()]
        }
      });
      setNewNacebelCode('');
    }
  };

  const removeNacebelCode = (index: number) => {
    setFormData({
      ...formData,
      activities: {
        ...formData.activities,
        nacebel_codes: formData.activities.nacebel_codes.filter((_, i) => i !== index)
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Modifier les informations de l'entreprise</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Read-only VAT Number */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro TVA (non modifiable)
            </label>
            <input
              type="text"
              value={company.vat || company.vat_number || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de l'entreprise
                </label>
                <select
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="micro">Micro (1-9 employés)</option>
                  <option value="small">Petite (10-49 employés)</option>
                  <option value="medium">Moyenne (50-249 employés)</option>
                  <option value="large">Grande (250+ employés)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'entreprise
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="PRIVATE">Privée</option>
                  <option value="PUBLIC">Publique</option>
                  <option value="NON_PROFIT">Sans but lucratif</option>
                  <option value="GOVERNMENT">Gouvernementale</option>
                  <option value="COOPERATIVE">Coopérative</option>
                  <option value="SOLE_PROPRIETORSHIP">Entreprise individuelle</option>
                  <option value="PARTNERSHIP">Partenariat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital (€)
              </label>
              <input
                type="number"
                value={formData.capital}
                onChange={(e) => setFormData({ ...formData, capital: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Activités</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activité principale
              </label>
              <input
                type="text"
                value={formData.activities.main_activity}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  activities: { ...formData.activities, main_activity: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activités de l'entreprise
              </label>
              <div className="space-y-2">
                {formData.activities.secondary_activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => {
                        const newActivities = [...formData.activities.secondary_activities];
                        newActivities[index] = e.target.value;
                        setFormData({ 
                          ...formData, 
                          activities: { ...formData.activities, secondary_activities: newActivities }
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeSecondaryActivity(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSecondaryActivity}
                    onChange={(e) => setNewSecondaryActivity(e.target.value)}
                    placeholder="Ajouter une activité"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addSecondaryActivity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codes NACEBEL
              </label>
              <div className="space-y-2">
                {formData.activities.nacebel_codes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        const newCodes = [...formData.activities.nacebel_codes];
                        newCodes[index] = e.target.value;
                        setFormData({ 
                          ...formData, 
                          activities: { ...formData.activities, nacebel_codes: newCodes }
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNacebelCode(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newNacebelCode}
                    onChange={(e) => setNewNacebelCode(e.target.value)}
                    placeholder="Ajouter un code NACEBEL"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addNacebelCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.activities.description}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  activities: { ...formData.activities, description: e.target.value }
                })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Note about establishments */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Les établissements, la forme légale, l'année fiscale et l'adresse ne peuvent pas être modifiés ici. 
              Ils sont gérés séparément dans le système.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>

          {updateMutation.isError && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              Erreur lors de la mise à jour. Veuillez réessayer.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanyEditModal;