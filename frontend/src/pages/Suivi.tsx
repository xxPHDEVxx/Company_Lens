import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { CompanyStats, CompanyFilters, CompanyList } from '../components/suivi';

interface FollowedCompany {
  id: string;
  name: string;
  vatNumber: string;
  legalForm: string;
  sector: string;
  city: string;
  region: 'flanders' | 'wallonia' | 'brussels';
  status: 'active' | 'inactive';
  followedSince: string;
  lastUpdate: string;
  employeeCount?: number;
  website?: string;
}

// Mock data for followed companies
const mockFollowedCompanies: FollowedCompany[] = [
  {
    id: '1',
    name: 'TechSolutions SPRL',
    vatNumber: 'BE0123456789',
    legalForm: 'SPRL',
    sector: 'Technologies de l\'information',
    city: 'Bruxelles',
    region: 'brussels',
    status: 'active',
    followedSince: '2024-01-15',
    lastUpdate: '2024-03-01',
    employeeCount: 25,
    website: 'https://techsolutions.be',
  },
  {
    id: '2',
    name: 'InnovateBelgium SA',
    vatNumber: 'BE0987654321',
    legalForm: 'SA',
    sector: 'Consulting',
    city: 'Gand',
    region: 'flanders',
    status: 'active',
    followedSince: '2024-02-03',
    lastUpdate: '2024-02-28',
    employeeCount: 50,
  },
  {
    id: '3',
    name: 'EcoServices ASBL',
    vatNumber: 'BE0555666777',
    legalForm: 'ASBL',
    sector: 'Environnement',
    city: 'Liège',
    region: 'wallonia',
    status: 'active',
    followedSince: '2024-02-20',
    lastUpdate: '2024-03-02',
    employeeCount: 12,
    website: 'https://ecoservices.be',
  },
  {
    id: '4',
    name: 'RetailPro SPRL',
    vatNumber: 'BE0444555666',
    legalForm: 'SPRL',
    sector: 'Commerce de détail',
    city: 'Anvers',
    region: 'flanders',
    status: 'inactive',
    followedSince: '2024-01-10',
    lastUpdate: '2024-02-15',
    employeeCount: 8,
  },
  {
    id: '5',
    name: 'DataAnalytics NV',
    vatNumber: 'BE0333444555',
    legalForm: 'NV',
    sector: 'Analyse de données',
    city: 'Louvain-la-Neuve',
    region: 'wallonia',
    status: 'active',
    followedSince: '2024-03-01',
    lastUpdate: '2024-03-05',
    employeeCount: 35,
    website: 'https://dataanalytics.be',
  },
  {
    id: '6',
    name: 'GreenEnergy Solutions',
    vatNumber: 'BE0222333444',
    legalForm: 'SA',
    sector: 'Énergies renouvelables',
    city: 'Bruges',
    region: 'flanders',
    status: 'active',
    followedSince: '2024-02-15',
    lastUpdate: '2024-03-03',
    employeeCount: 18,
  },
];


const SuiviContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>(mockFollowedCompanies);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRegion, setFilterRegion] = useState<'all' | 'flanders' | 'wallonia' | 'brussels'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'followedSince' | 'lastUpdate'>('followedSince');

  const handleUnfollow = (companyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir arrêter de suivre cette entreprise ?')) {
      setFollowedCompanies(prev => prev.filter(company => company.id !== companyId));
    }
  };

  const filteredAndSortedCompanies = followedCompanies
    .filter(company => {
      if (filterStatus !== 'all' && company.status !== filterStatus) return false;
      if (filterRegion !== 'all' && company.region !== filterRegion) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'followedSince':
          return new Date(b.followedSince).getTime() - new Date(a.followedSince).getTime();
        case 'lastUpdate':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return 0;
      }
    });


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Fixed centered layout with equal spacing */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:ml-28' : 'md:ml-64'
      }`}>
        <div className="px-6 md:px-8 lg:px-12 pt-20 pb-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Entreprises suivies
            </h1>
            <p className="text-gray-600">
              Surveillez l'évolution des entreprises qui vous intéressent
            </p>
          </div>

          {/* Filters and Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {/* Stats */}
            <CompanyStats followedCompanies={followedCompanies} />

            {/* Filters */}
            <CompanyFilters
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterRegion={filterRegion}
              setFilterRegion={setFilterRegion}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* Companies List */}
          <CompanyList
            companies={filteredAndSortedCompanies}
            onUnfollow={handleUnfollow}
          />
        </div>
      </div>
    </div>
  );
};

const Suivi: React.FC = () => {
  return <SuiviContent />;
};

export default Suivi;