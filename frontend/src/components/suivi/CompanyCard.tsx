import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Company } from '../../types/api';

interface CompanyCardProps {
  company: Company;
  onUnfollow: (companyId: string) => void;
  getStatusBadge: (status: 'active' | 'inactive') => React.ReactNode;
  getRegionBadge: (region: 'flanders' | 'wallonia' | 'brussels') => React.ReactNode;
  formatDate: (dateString: string) => string;
}

const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onUnfollow,
  getStatusBadge,
  getRegionBadge,
  formatDate,
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {company.name}
          </h3>
          <p className="text-sm text-gray-600">{company.legalForm}</p>
        </div>
        <button
          onClick={() => onUnfollow(company.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
          title="Arrêter de suivre"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* VAT and Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-600 font-mono">{company.vatNumber || company.vat}</span>
        {getStatusBadge(company.status)}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="line-clamp-1">{company.sector}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{company.city}</span>
        </div>
        {company.employees && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{company.employees} employé{(company.employees) !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Region Badge */}
      {company.region && (
        <div className="mb-4">
          {getRegionBadge(company.region)}
        </div>
      )}

      {/* Dates */}
      <div className="text-xs text-gray-500 space-y-1 mb-4">
        {company.followedSince && <div>Suivi depuis: {formatDate(company.followedSince)}</div>}
        {company.lastUpdate && <div>Dernière mise à jour: {formatDate(company.lastUpdate)}</div>}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={() => navigate(`/company/${company.id}`, { state: { from: 'Suivi', route: '/suivi' } })}
          className="flex-1 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium">
          Voir détails
        </button>
        {company.website && (
          <a 
            href={company.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;