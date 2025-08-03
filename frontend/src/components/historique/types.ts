export interface Activity {
  id: string;
  type: 'recherche' | 'groupe' | 'suivi';
  title: string;
  description: string;
  timestamp: Date;
  details: {
    companyName?: string;
    vatNumber?: string;
    groupName?: string;
    companiesCount?: number;
  };
}

export type ActivityType = 'all' | 'recherche' | 'groupe' | 'suivi';
export type DateRange = 'all' | 'today' | 'week' | 'month';