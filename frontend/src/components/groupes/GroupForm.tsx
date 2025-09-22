import React from 'react';

interface NewGroupFormData {
  name: string;
  description: string;
  icon: string;
}

interface GroupFormProps {
  mode: 'create' | 'edit';
  initialData?: NewGroupFormData;
  onSubmit: (data: NewGroupFormData) => Promise<void>;
  onCancel: () => void;
  getGroupIcon: (iconKey?: string) => React.ReactNode;
  groupIcons: Record<string, { name: string; icon: React.ReactNode }>;
  isLoading?: boolean;
}

const GroupForm: React.FC<GroupFormProps> = ({
  mode,
  initialData = { name: '', description: '', icon: 'folder' },
  onSubmit,
  onCancel,
  getGroupIcon,
  groupIcons,
  isLoading = false,
}) => {
  const [formData, setFormData] = React.useState<NewGroupFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {getGroupIcon(formData.icon)}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Créer un nouveau groupe' : 'Modifier le groupe'}
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
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  onClick={() => setFormData(prev => ({ ...prev, icon: key }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                    formData.icon === key
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
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {mode === 'create' ? 'Créer' : 'Modifier'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupForm;