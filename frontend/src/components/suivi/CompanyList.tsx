import React from 'react';
import CompanyCard from './CompanyCard';
import { getStatusBadge, getRegionBadge } from './CompanyBadges';

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

interface CompanyListProps {
  companies: FollowedCompany[];
  onUnfollow: (companyId: string) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ companies, onUnfollow }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
        <p className="text-gray-600 mb-4">Aucune entreprise ne correspond aux filtres sélectionnés</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onUnfollow={onUnfollow}
          getStatusBadge={getStatusBadge}
          getRegionBadge={getRegionBadge}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default CompanyList;