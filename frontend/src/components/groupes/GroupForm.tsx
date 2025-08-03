import React from 'react';

interface NewGroupFormData {
  name: string;
  description: string;
  icon: string;
}

interface GroupFormProps {
  newGroup: NewGroupFormData;
  setNewGroup: React.Dispatch<React.SetStateAction<NewGroupFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
  getGroupIcon: (iconKey?: string) => React.ReactNode;
  groupIcons: Record<string, { name: string; icon: React.ReactNode }>;
}

const GroupForm: React.FC<GroupFormProps> = ({
  newGroup,
  setNewGroup,
  onSubmit,
  onCancel,
  getGroupIcon,
  groupIcons,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {getGroupIcon(newGroup.icon)}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Créer un nouveau groupe
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du groupe *
            </label>
            <input
              type="text"
              id="groupName"
              value={newGroup.name}
              onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Concurrents principaux"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="groupDescription"
              value={newGroup.description}
              onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du groupe..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icône du groupe
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(groupIcons).map(([key, iconData]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNewGroup(prev => ({ ...prev, icon: key }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                    newGroup.icon === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  title={iconData.name}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {iconData.icon}
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight">
                    {iconData.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={!newGroup.name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;