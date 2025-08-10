import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useCompany } from '../../hooks/queries';
import { CompanyMetric, CompanyPerformance, CompanyLoadingState, CompanyErrorState } from './company-info';

const CompanyInfo = () => {
  const navigate = useNavigate();
  
  // Use React Query hooks
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(currentUser?.companyId);
  
  const loading = userLoading || companyLoading;
  const error = !currentUser?.companyId ? 'Aucune entreprise associée à votre compte' : 
                 companyError ? 'Erreur lors du chargement des données' : null;
  
  const handleViewDetails = () => {
    if (company) {
      navigate(`/company/${company.id}`, {
        state: { from: 'Tableau de bord', route: '/dashboard' }
      });
    }
  };

  if (loading) {
    return <CompanyLoadingState />;
  }

  if (error || !company) {
    return <CompanyErrorState error={error} />;
  }

  const latestFinancialData = company.financialData?.[company.financialData.length - 1];
  const previousFinancialData = company.financialData?.[company.financialData.length - 2];

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Votre entreprise</h3>
        <p className="text-gray-600 mb-8">Informations de votre entreprise principale</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - General Information */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3 mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.vat}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="5" />
                </svg>
                {company.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompanyMetric
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                value={company.employees || 0}
                label="Employés"
              />
              <CompanyMetric
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                value={`€${latestFinancialData ? (latestFinancialData.revenue / 1000000).toFixed(1) : '0'}M`}
                label="Chiffre d'affaires"
              />
              <CompanyMetric
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                value={company.establishments?.length || 0}
                label="Établissements"
              />
              <CompanyMetric
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
                value={`€${latestFinancialData ? (latestFinancialData.profit / 1000).toFixed(0) : '0'}K`}
                label="Bénéfice"
              />
            </div>
          </div>

          {/* Right Column - Performance & Evolution */}
          <CompanyPerformance
            latestFinancialData={latestFinancialData}
            previousFinancialData={previousFinancialData}
            financialMetrics={company.financialMetrics}
          />
        </div>
        
        {/* View Details Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleViewDetails}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Voir détails
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;