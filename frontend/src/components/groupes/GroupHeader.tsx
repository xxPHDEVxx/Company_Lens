import React from 'react';
import { Users, Calendar, Building2 } from 'lucide-react';

interface GroupHeaderProps {
  group: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    companiesCount: number;
    createdAt: string;
    updatedAt?: string;
  };
  getGroupIcon: (iconKey?: string) => React.ReactNode;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group, getGroupIcon }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-purple-600">
              {getGroupIcon(group.icon)}
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{group.name || 'N/A'}</h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600 break-words">{group.description || 'N/A'}</p>

              {/* Info badges - stack on mobile, inline on larger screens */}
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{group.companiesCount || 0} entreprise{group.companiesCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Créé le {formatDate(group.createdAt)}</span>
                </div>
                {group.updatedAt && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">Modifié le {formatDate(group.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0">
              <span className="inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                Groupe actif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;