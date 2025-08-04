import React from 'react';

interface CompanyGroup {
  id: string;
  name: string;
  description: string;
  companiesCount: number;
  createdAt: string;
  icon?: string;
}

interface GroupCardProps {
  group: CompanyGroup;
  onDelete: (groupId: string) => void;
  onEdit: (group: CompanyGroup) => void;
  getGroupIcon: (iconKey?: string) => React.ReactNode;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onDelete, onEdit, getGroupIcon }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {getGroupIcon(group.icon)}
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {group.name}
          </h3>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(group)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title="Modifier le groupe"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(group.id)}
            className="p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-red-500 hover:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {group.description}
      </p>

      {/* Stats */}
      <div className="text-gray-600 text-sm space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>{group.companiesCount} entreprise{group.companiesCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Créé le {formatDate(group.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100">
        <button className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
          Voir les entreprises
        </button>
      </div>
    </div>
  );
};

export default GroupCard;