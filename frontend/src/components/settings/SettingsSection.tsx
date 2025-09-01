import React from 'react';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Composant wrapper réutilisable pour les sections de paramètres
 * Fournit une mise en page cohérente pour toutes les sections
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default SettingsSection;