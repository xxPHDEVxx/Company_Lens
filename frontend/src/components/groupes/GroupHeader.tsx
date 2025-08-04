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
    updatedAt: string;
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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-purple-600">
              {getGroupIcon(group.icon)}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name || 'N/A'}</h1>
            <p className="mt-1 text-gray-600">{group.description || 'N/A'}</p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                <span>{group.companiesCount || 0} entreprise{group.companiesCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Créé le {formatDate(group.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>Modifié le {formatDate(group.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            Groupe actif
          </span>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;