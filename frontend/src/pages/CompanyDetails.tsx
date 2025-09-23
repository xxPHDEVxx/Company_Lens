import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Star } from 'lucide-react';
import CompanyHeader from '../components/company/CompanyHeader';
import GeneralInfo from '../components/company/GeneralInfo';
import EstablishmentsList from '../components/company/EstablishmentsList';
import ContactInfo from '../components/company/ContactInfo';
import ActivitiesInfo from '../components/company/ActivitiesInfo';
import FinancialCharts from '../components/company/FinancialCharts';
import  FinancialMetrics from '../components/company/FinancialMetrics';
import { useCompany, useFollowCompany, useUnfollowCompany } from '../hooks/queries';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/common/Toast';

const CompanyDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [activeTab, setActiveTab] = useState('general');
  
  // Determine the source page from location state or default to 'Suivi'
  const sourcePage = location.state?.from || 'Suivi';
  const sourceRoute = location.state?.route || '/suivi';

  // Use React Query hooks with refetchOnWindowFocus to ensure fresh data
  const { data: company, isLoading, error, refetch } = useCompany(companyId);
  const followMutation = useFollowCompany();
  const unfollowMutation = useUnfollowCompany();
  
  // Refetch on window focus to ensure we always have the latest data
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!company) return;
    
    try {
      if (company.is_followed) {
        await unfollowMutation.mutateAsync(company.id);
        success('Entreprise retirée des suivis');
      } else {
        await followMutation.mutateAsync(company.id);
        success('Entreprise ajoutée aux suivis');
      }
    } catch (err) {
      showError('Erreur lors de la mise à jour du suivi');
    }
  };

  const tabs = [
    { id: 'general', label: 'Informations Générales' },
    { id: 'activities', label: 'Activités' },
    { id: 'financial', label: 'Données Financières' },
    { id: 'establishments', label: 'Établissements' },
    { id: 'contact', label: 'Contact' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(sourceRoute)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span>{sourcePage}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Chargement des données de l'entreprise...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    const errorMessage = error instanceof Error ? error.message : 'Entreprise introuvable';
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate(sourceRoute)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span>{sourcePage}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map company data (now always in camelCase)
  const generalInfo = {
    vat: company.vat,
    legalForm: company.legalForm || '-',
    creationDate: company.creationDate || '-',
    capital: company.capital || '-',
    employees: company.employees || 0,
    naceCodes: company.activities?.nacebelCodes || [],
    activity: company.activities?.description || '-',
    fiscalYear: company.fiscalYear || '-',
    lastUpdate: company.lastUpdate || '-',
    companyType: company.companyType || '-',
    companySize: company.companySize || '-',
    companyDescription: company.activities?.description || '',
  };

  const contactInfo = {
    address: company.address || {
      street: undefined,
      streetNumber: undefined,
      city: company.city,
      postalCode: undefined,
      country: 'Belgique',
    },
    phone: company.phone,
    email: company.email,
    website: company.website,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(sourceRoute)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>{sourcePage}</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleFollowToggle}
                className={`p-2 transition-colors ${
                  company?.is_followed 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={company?.is_followed ? 'Ne plus suivre' : 'Suivre cette entreprise'}
              >
                <Star 
                  className="w-5 h-5" 
                  fill={company?.is_followed ? 'currentColor' : 'none'}
                />
              </button>
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Header */}
        <CompanyHeader company={company} />

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-indigo-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <GeneralInfo info={generalInfo} />
          )}

          {activeTab === 'activities' && (
            <ActivitiesInfo activities={company.activities} />
          )}

          {activeTab === 'financial' && (
            <>
              {company.financialData && <FinancialCharts data={company.financialData} />}
              {company.financialMetrics && <FinancialMetrics metrics={company.financialMetrics} />}
            </>
          )}

          {activeTab === 'establishments' && (
            <EstablishmentsList establishments={company.establishments || []} />
          )}

          {activeTab === 'contact' && (
            <ContactInfo contact={contactInfo} />
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default CompanyDetails;