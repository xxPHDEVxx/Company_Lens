import React from 'react';
import { Building2, TrendingUp, MapPin, Users, BarChart3, FileText, Info } from 'lucide-react';
import type { CompanyGroup, Company } from '../../types/api';

interface GroupOverviewProps {
  group: CompanyGroup;
  companies: Company[];
}

const GroupOverview: React.FC<GroupOverviewProps> = ({ group, companies }) => {
  // Calculate statistics from companies
  const totalEmployees = companies.reduce((sum, company) => sum + (company.employees || 0), 0);
  const uniqueSectors = new Set(companies.map(c => c.sector).filter(Boolean)).size;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const primaryRegion = companies.length > 0 ? getMostCommonRegion(companies) : 'N/A';
  
  function getMostCommonRegion(companies: Company[]): string {
    const regionCounts: Record<string, number> = {};
    companies.forEach(company => {
      if (company.region) {
        regionCounts[company.region] = (regionCounts[company.region] || 0) + 1;
      }
    });
    
    const regions = Object.entries(regionCounts);
    if (regions.length === 0) return 'Belgique';
    
    const mostCommon = regions.reduce((a, b) => a[1] > b[1] ? a : b);
    const regionNames: Record<string, string> = {
      'flanders': 'Flandre',
      'wallonia': 'Wallonie',
      'brussels': 'Bruxelles'
    };
    return regionNames[mostCommon[0]] || mostCommon[0];
  }
  return (
    <div className="space-y-6">
      {/* Main Information Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du Groupe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Nombre d'entreprises</p>
                <p className="font-medium text-gray-900">{companies.length}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Type de groupe</p>
                <p className="font-medium text-gray-900">Groupe personnalisé</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Visibilité</p>
                <p className="font-medium text-gray-900">Privé</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="font-medium text-gray-900">Actif</p>
              </div>
            </div>
            <div className="flex items-start">
              <BarChart3 className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Performance moyenne</p>
                <p className="font-medium text-gray-900">{activeCompanies > 0 ? 'En activité' : 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Localisation principale</p>
                <p className="font-medium text-gray-900">{primaryRegion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Description du groupe</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">{group.description || 'Aucune description disponible pour ce groupe.'}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-purple-900">Total entreprises</h3>
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{companies.length}</p>
          <p className="text-sm text-purple-700 mt-1">Dans ce groupe</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">Secteurs</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{uniqueSectors || 'N/A'}</p>
          <p className="text-sm text-blue-700 mt-1">Différents secteurs</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-900">Employés total</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{totalEmployees > 0 ? totalEmployees.toLocaleString('fr-FR') : 'N/A'}</p>
          <p className="text-sm text-green-700 mt-1">Employés cumulés</p>
        </div>
      </div>
    </div>
  );
};

export default GroupOverview;