import React, { useState } from 'react';
import { X, Trash2, Plus, Building2, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Company {
  id: string;
  name: string;
  vatNumber: string;
  sector?: string;
  location?: string;
}

interface GroupCompaniesViewProps {
  group: {
    id: string;
    name: string;
    description: string;
    icon?: string;
  };
  companies: Company[];
  followedCompanies: Company[];
  onBack: () => void;
  onDeleteCompany: (groupId: string, companyId: string) => void;
  onAddCompanies: (groupId: string, companyIds: string[]) => void;
  getGroupIcon: (iconKey?: string) => React.ReactNode;
}

const GroupCompaniesView: React.FC<GroupCompaniesViewProps> = ({
  group,
  companies,
  followedCompanies,
  onBack,
  onDeleteCompany,
  onAddCompanies,
  getGroupIcon,
}) => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter companies that are not already in the group
  const availableCompanies = followedCompanies.filter(
    (company) => !companies.some((c) => c.id === company.id)
  );

  // Filter available companies based on search term
  const filteredCompanies = availableCompanies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.vatNumber.includes(searchTerm)
  );

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cette entreprise du groupe ?')) {
      onDeleteCompany(group.id, companyId);
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

  const handleAddCompanies = () => {
    if (selectedCompanies.length > 0) {
      onAddCompanies(group.id, selectedCompanies);
      setSelectedCompanies([]);
      setShowAddModal(false);
      setSearchTerm('');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              {getGroupIcon(group.icon)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{group.name}</h2>
              <p className="text-purple-100 text-sm">{group.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          <span className="font-medium">{companies.length}</span> entreprise{companies.length !== 1 ? 's' : ''} dans ce groupe
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          Ajouter une entreprise
        </button>
      </div>

      {/* Companies List */}
      {companies.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Aucune entreprise dans ce groupe</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Ajouter des entreprises
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <button
                  onClick={() => handleDeleteCompany(company.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Retirer du groupe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
              <p className="text-sm text-gray-600 mb-2">TVA: {company.vatNumber}</p>
              {company.sector && (
                <p className="text-sm text-gray-500 mb-1">Secteur: {company.sector}</p>
              )}
              {company.location && (
                <p className="text-sm text-gray-500">Localisation: {company.location}</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewCompanyDetails(company.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Companies Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Ajouter des entreprises</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCompanies([]);
                    setSearchTerm('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou numéro TVA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Companies List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? 'Aucune entreprise trouvée'
                      : 'Toutes vos entreprises suivies sont déjà dans ce groupe'}
                  </div>
                ) : (
                  filteredCompanies.map((company) => (
                    <label
                      key={company.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company.id)}
                        onChange={() => toggleCompanySelection(company.id)}
                        className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-600">TVA: {company.vatNumber}</div>
                        {company.sector && (
                          <div className="text-sm text-gray-500">{company.sector}</div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedCompanies.length} entreprise{selectedCompanies.length !== 1 ? 's' : ''} sélectionnée{selectedCompanies.length !== 1 ? 's' : ''}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCompanies([]);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddCompanies}
                  disabled={selectedCompanies.length === 0}
                  className={`px-4 py-2 rounded-lg transition-colors ${
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
    </div>
  );
};

export default GroupCompaniesView;