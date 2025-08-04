import React from 'react';
import { BarChart3, TrendingUp, MapPin, Building2, Users } from 'lucide-react';
import type { Company } from '../../types/api';

interface GroupStatisticsProps {
  companies: Company[];
}

const GroupStatistics: React.FC<GroupStatisticsProps> = ({ companies }) => {
  // Calculate statistics from companies
  const totalEmployees = companies.reduce((sum, company) => sum + (company.employees || 0), 0);
  const averageEmployees = companies.length > 0 ? Math.round(totalEmployees / companies.length) : 0;
  const companiesWithEmployeeData = companies.filter(c => c.employees && c.employees > 0).length;
  
  // Group companies by sector
  const sectorCounts = companies.reduce((acc, company) => {
    const sector = company.sector || 'Non spécifié';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Group companies by city
  const cityCounts = companies.reduce((acc, company) => {
    const city = company.city || 'Non spécifié';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort sectors by count
  const topSectors = Object.entries(sectorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
    
  // Sort cities by count
  const topCities = Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Building2 className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
          <p className="text-sm text-gray-600">Entreprises</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalEmployees > 0 ? totalEmployees.toLocaleString('fr-FR') : 'N/A'}</p>
          <p className="text-sm text-gray-600">Employés</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-500">Moyenne</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{companiesWithEmployeeData > 0 ? averageEmployees : 'N/A'}</p>
          <p className="text-sm text-gray-600">Employés/entreprise</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-gray-500">Diversité</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(sectorCounts).length || 'N/A'}</p>
          <p className="text-sm text-gray-600">Secteurs</p>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sectors Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Répartition par secteur</h3>
          </div>
          {topSectors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée de secteur disponible</p>
          ) : (
            <div className="space-y-3">
              {topSectors.map(([sector, count]) => {
                const percentage = Math.round((count / companies.length) * 100);
                return (
                  <div key={sector}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{sector}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Répartition géographique</h3>
          </div>
          {topCities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune donnée de localisation disponible</p>
          ) : (
            <div className="space-y-3">
              {topCities.map(([city, count]) => {
                const percentage = Math.round((count / companies.length) * 100);
                return (
                  <div key={city}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{city}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Company Size Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Distribution par taille d'entreprise</h3>
        </div>
        {companiesWithEmployeeData === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune donnée d'effectif disponible</p>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Micro (1-9)', min: 1, max: 9, color: 'bg-blue-100 text-blue-800' },
            { label: 'Petite (10-49)', min: 10, max: 49, color: 'bg-green-100 text-green-800' },
            { label: 'Moyenne (50-249)', min: 50, max: 249, color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Grande (250+)', min: 250, max: Infinity, color: 'bg-red-100 text-red-800' },
          ].map(({ label, min, max, color }) => {
            const count = companies.filter(c => {
              const employees = c.employees || 0;
              return employees >= min && employees <= max;
            }).length;
            
            return (
              <div key={label} className="text-center">
                <div className={`rounded-lg p-4 ${color}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm mt-1">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};

export default GroupStatistics;