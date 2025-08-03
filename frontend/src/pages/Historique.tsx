import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import ActivityFilters from '../components/historique/ActivityFilters';
import ActivityTimeline from '../components/historique/ActivityTimeline';
import { mockActivities } from '../components/historique/mockData';
import type { ActivityType, DateRange } from '../components/historique/types';
import { filterActivitiesByType, filterActivitiesByDateRange } from '../components/historique/utils';

const HistoriqueContent: React.FC = () => {
  const { isCollapsed } = useSidebar();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Dynamic left margin based on sidebar state */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:ml-28' : 'md:ml-64'
      }`}>
        <div className="px-6 md:px-8 lg:px-12 pt-20 pb-8 max-w-6xl mx-auto">
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
        </div>
      </div>
    </div>
  );
};

const Historique: React.FC = () => {
  return <HistoriqueContent />;
};

export default Historique;