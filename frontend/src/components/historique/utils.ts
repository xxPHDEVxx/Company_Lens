import type { Activity, ActivityType, DateRange } from './types';

// Format timestamp to relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Il y a moins d\'une heure';
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Hier';
    } else {
      return `Il y a ${diffInDays} jours`;
    }
  }
};

// Get icon data for activity type
export const getActivityIconData = (type: string): { viewBox: string; path: string } | null => {
  switch (type) {
    case 'recherche':
      return {
        viewBox: "0 0 24 24",
        path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      };
    case 'groupe':
      return {
        viewBox: "0 0 24 24",
        path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      };
    case 'suivi':
      return {
        viewBox: "0 0 24 24",
        path: "M5 13l4 4L19 7"
      };
    default:
      return null;
  }
};

// Get color for activity type
export const getActivityColor = (type: string): string => {
  switch (type) {
    case 'recherche':
      return 'bg-green-100 text-green-800';
    case 'groupe':
      return 'bg-purple-100 text-purple-800';
    case 'suivi':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Filter activities by date range
export const filterActivitiesByDateRange = (activities: Activity[], dateRange: DateRange): Activity[] => {
  const now = new Date();
  
  return activities.filter(activity => {
    const activityDate = activity.timestamp;
    const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    switch (dateRange) {
      case 'today':
        return daysDiff === 0;
      case 'week':
        return daysDiff <= 7;
      case 'month':
        return daysDiff <= 30;
      default:
        return true;
    }
  });
};

// Filter activities by type
export const filterActivitiesByType = (activities: Activity[], activityType: ActivityType): Activity[] => {
  if (activityType === 'all') {
    return activities;
  }
  return activities.filter(activity => activity.type === activityType);
};