import React from 'react';
import GroupCard from './GroupCard';

interface CompanyGroup {
  id: string;
  name: string;
  description: string;
  companiesCount: number;
  createdAt: string;
  icon?: string;
}

interface GroupListProps {
  groups: CompanyGroup[];
  onDeleteGroup: (groupId: string) => void;
  onEditGroup: (group: CompanyGroup) => void;
  onShowNewGroupForm: () => void;
  getGroupIcon: (iconKey?: string) => React.ReactNode;
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  onDeleteGroup,
  onEditGroup,
  onShowNewGroupForm,
  getGroupIcon,
}) => {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun groupe créé</h3>
        <p className="text-gray-600 mb-4">Commencez par créer votre premier groupe d'entreprises</p>
        <button
          onClick={onShowNewGroupForm}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Créer un groupe
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onDelete={onDeleteGroup}
          onEdit={onEditGroup}
          onViewCompanies={() => {}}
          getGroupIcon={getGroupIcon}
        />
      ))}
    </div>
  );
};

export default GroupList;