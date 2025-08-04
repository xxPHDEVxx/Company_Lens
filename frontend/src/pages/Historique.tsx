import React, { useState } from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import ActivityFilters from '../components/historique/ActivityFilters';
import ActivityTimeline from '../components/historique/ActivityTimeline';
import { mockActivities } from '../components/historique/mockData';
import type { ActivityType, DateRange } from '../components/historique/types';
import { filterActivitiesByType, filterActivitiesByDateRange } from '../components/historique/utils';

const HistoriqueContent: React.FC = () => {
  const [filterType, setFilterType] = useState<ActivityType>('all');
  const [filterDateRange, setFilterDateRange] = useState<DateRange>('all');

  // Filter activities based on type and date
  const typeFilteredActivities = filterActivitiesByType(mockActivities, filterType);
  const filteredActivities = filterActivitiesByDateRange(typeFilteredActivities, filterDateRange);

  // Reset filters handler
  const handleResetFilters = () => {
    setFilterType('all');
    setFilterDateRange('all');
  };

  return (
    <MainContentLayout>
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Historique d'activité
                </h1>
                <p className="text-blue-100">
                  Consultez l'historique de vos recherches et actions
                </p>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <ActivityFilters
            filterType={filterType}
            filterDateRange={filterDateRange}
            onFilterTypeChange={setFilterType}
            onFilterDateRangeChange={setFilterDateRange}
            onResetFilters={handleResetFilters}
          />

          {/* Activity Timeline */}
          <ActivityTimeline activities={filteredActivities} />
    </MainContentLayout>
  );
};

const Historique: React.FC = () => {
  return <HistoriqueContent />;
};

export default Historique;