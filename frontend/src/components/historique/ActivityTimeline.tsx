import React from 'react';
import type { Activity } from './types';
import ActivityItem from './ActivityItem';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500">Aucune activité trouvée pour les filtres sélectionnés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          showConnector={index < activities.length - 1}
        />
      ))}
    </div>
  );
};

export default ActivityTimeline;