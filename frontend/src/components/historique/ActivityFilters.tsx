import React from 'react';
import type { ActivityType, DateRange } from './types';

interface ActivityFiltersProps {
  filterType: ActivityType;
  filterDateRange: DateRange;
  onFilterTypeChange: (type: ActivityType) => void;
  onFilterDateRangeChange: (dateRange: DateRange) => void;
  onResetFilters: () => void;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filterType,
  filterDateRange,
  onFilterTypeChange,
  onFilterDateRangeChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Activity Type Filter */}
        <div>
          <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-2">
            Type d'activité
          </label>
          <select
            id="activityType"
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as ActivityType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les activités</option>
            <option value="recherche">Recherche</option>
            <option value="groupe">Groupe</option>
            <option value="suivi">Suivi</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select
            id="dateRange"
            value={filterDateRange}
            onChange={(e) => onFilterDateRangeChange(e.target.value as DateRange)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toute la période</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* Reset Filters */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onResetFilters}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
};

export default ActivityFilters;