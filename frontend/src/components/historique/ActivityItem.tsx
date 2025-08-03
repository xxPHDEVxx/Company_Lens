import React from 'react';
import type { Activity } from './types';
import { formatRelativeTime, getActivityIconData, getActivityColor } from './utils';

interface ActivityItemProps {
  activity: Activity;
  showConnector?: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, showConnector = false }) => {
  const iconData = getActivityIconData(activity.type);
  
  return (
    <div className="relative">
      {/* Timeline connector */}
      {showConnector && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
      )}
      
      {/* Activity Item */}
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 relative">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-2 rounded-full ${getActivityColor(activity.type)} flex-shrink-0`}>
            {iconData && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox={iconData.viewBox}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconData.path} />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{activity.title}</h3>
              <span className="text-sm text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
            </div>
            <p className="text-gray-600 mb-2">{activity.description}</p>
            
            {/* Details */}
            <div className="flex flex-wrap gap-2 text-sm">
              {activity.details.companyName && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {activity.details.companyName}
                </span>
              )}
              {activity.details.vatNumber && (
                <span className="bg-gray-100 px-2 py-1 rounded font-mono">
                  {activity.details.vatNumber}
                </span>
              )}
              {activity.details.groupName && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {activity.details.groupName}
                </span>
              )}
              {activity.details.companiesCount !== undefined && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {activity.details.companiesCount} entreprises
                </span>
              )}
            </div>
          </div>

          {/* Activity Type Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;