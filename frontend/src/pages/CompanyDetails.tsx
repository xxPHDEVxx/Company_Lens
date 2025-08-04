import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import CompanyHeader from '../components/company/CompanyHeader';
import GeneralInfo from '../components/company/GeneralInfo';
import EstablishmentsList from '../components/company/EstablishmentsList';
import ContactInfo from '../components/company/ContactInfo';
import FinancialCharts from '../components/company/FinancialCharts';
import FinancialMetrics from '../components/company/FinancialMetrics';

const CompanyDetails: React.FC = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // companyId would be used to fetch company data in a real application
  const [activeTab, setActiveTab] = useState('general');
  
  // Determine the source page from location state or default to 'Suivi'
  const sourcePage = location.state?.from || 'Suivi';
  const sourceRoute = location.state?.route || '/suivi';

  // Mock data - In a real app, this would be fetched based on companyId
  const companyData = {
    name: 'TechInnovate Belgium SA',
    logo: undefined,
    status: 'active' as const,
    vat: 'BE0123456789',
    legalForm: 'Société Anonyme (SA)',
    creationDate: '15/03/2010',
    mainAddress: 'Bruxelles',
  };

  const generalInfo = {
    vat: 'BE0123456789',
    legalForm: 'Société Anonyme (SA)',
    creationDate: '15/03/2010',
    capital: '500,000 €',
    employees: 127,
    naceCodes: ['62.010', '62.020'],
    activity: 'Programmation informatique et consultation en technologies de l\'information',
    language: 'Français',
    fiscalYear: '01/01 - 31/12',
    lastUpdate: '22/10/2024',
    companyType: 'for-profit',
    companySize: 'medium',
    companyDescription: 'TechInnovate Belgium SA est une société spécialisée dans le développement de solutions logicielles innovantes pour les entreprises. Fondée en 2010, elle propose des services de consultation, de développement sur mesure et d\'intégration de systèmes. L\'entreprise se distingue par son expertise en intelligence artificielle, cloud computing et transformation digitale. Avec une équipe de plus de 120 professionnels, TechInnovate accompagne ses clients dans leur parcours de digitalisation en offrant des solutions adaptées à leurs besoins spécifiques.',
  };

  const establishments = [
    {
      id: '1',
      unitNumber: '2.123.456.789',
      name: 'TechInnovate Belgium SA - Siège social',
      type: 'headquarters' as const,
      address: {
        street: 'Avenue Louise',
        streetNumber: '251',
        city: 'Bruxelles',
        postalCode: '1050',
        country: 'Belgique',
      },
      phone: '+32 2 123 45 67',
      email: 'info@techinnovate.be',
      employees: 85,
      creationDate: '15/03/2010',
      status: 'active' as const,
    },
    {
      id: '2',
      unitNumber: '2.123.456.790',
      name: 'TechInnovate Belgium SA - Anvers',
      type: 'branch' as const,
      address: {
        street: 'Meir',
        streetNumber: '12',
        city: 'Anvers',
        postalCode: '2000',
        country: 'Belgique',
      },
      phone: '+32 3 234 56 78',
      email: 'antwerp@techinnovate.be',
      employees: 35,
      creationDate: '01/06/2015',
      status: 'active' as const,
    },
    {
      id: '3',
      unitNumber: '2.123.456.791',
      name: 'TechInnovate Belgium SA - Site de production',
      type: 'production' as const,
      address: {
        street: 'Parc Industriel',
        streetNumber: '5',
        city: 'Liège',
        postalCode: '4000',
        country: 'Belgique',
      },
      phone: '+32 4 345 67 89',
      employees: 7,
      creationDate: '15/09/2018',
      status: 'active' as const,
    },
  ];

  const contactInfo = {
    Address: {
      street: 'Avenue Louise',
      streetNumber: '251',
      city: 'Bruxelles',
      postalCode: '1050',
      country: 'Belgique',
    },
    phone: '+32 2 123 45 67',
    email: 'info@techinnovate.be',
    website: 'https://www.techinnovate.be',
  };

  const financialData = [
    { year: 2020, revenue: 8500000, profit: 850000, margin: 10.0, employees: 95 },
    { year: 2021, revenue: 9200000, profit: 920000, margin: 10.0, employees: 105 },
    { year: 2022, revenue: 10500000, profit: 1050000, margin: 10.0, employees: 115 },
    { year: 2023, revenue: 12800000, profit: 1280000, margin: 10.0, employees: 127 },
    { year: 2024, revenue: 14200000, profit: 1420000, margin: 10.0, employees: 135 },
  ];

  const financialMetrics = {
    revenue: { 
      current: 14200000, 
      previous: 12800000, 
      growth: 10.9 
    },
    margin: { 
      current: 10.0, 
      previous: 10.0, 
      growth: 0.0 
    },
    profit: { 
      current: 1420000, 
      previous: 1280000, 
      growth: 10.9 
    },
  };

  const tabs = [
    { id: 'general', label: 'Informations Générales' },
    { id: 'financial', label: 'Données Financières' },
    { id: 'establishments', label: 'Établissements' },
    { id: 'contact', label: 'Contact' },
  ];

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
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Star className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="w-5 h-5" />
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
        <CompanyHeader company={companyData} />

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

          {activeTab === 'financial' && (
            <>
              <FinancialCharts data={financialData} />
              <FinancialMetrics metrics={financialMetrics} />
            </>
          )}

          {activeTab === 'establishments' && (
            <EstablishmentsList establishments={establishments} />
          )}

          {activeTab === 'contact' && (
            <ContactInfo contact={contactInfo} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;