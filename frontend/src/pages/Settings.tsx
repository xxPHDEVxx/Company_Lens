import React, { useState } from 'react';
import { 
  GeneralSettings, 
  NotificationSettings, 
  PrivacySettings, 
  SecuritySettings, 
  DataManagement 
} from '../components/settings';

type SettingsTab = 'general' | 'notifications' | 'privacy' | 'security' | 'data';

/**
 * Page principale des param�tres
 * Permet aux utilisateurs de g�rer tous leurs param�tres de compte
 */
const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Configuration des onglets
  const tabs = [
    { id: 'general' as SettingsTab, label: 'Général'},
    { id: 'notifications' as SettingsTab, label: 'Notifications'},
    { id: 'privacy' as SettingsTab, label: 'Confidentialité'},
    { id: 'security' as SettingsTab, label: 'Sécurité'},
    { id: 'data' as SettingsTab, label: 'Données'},
  ];

  // Rendu du contenu selon l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'security':
        return <SecuritySettings />;
      case 'data':
        return <DataManagement />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-t�te de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-2 text-gray-600">
            Gérez vos préférences et configurez votre compte Company Lens
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation lat�rale */}
          <nav className="lg:w-64 flex-shrink-0">
            <ul className="space-y-1 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Actions rapides */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Actions rapides
              </h3>
              <ul className="space-y-2">
                <li>
                  <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Centre d'aide
                  </button>
                </li>
                <li>
                  <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Contacter le support
                  </button>
                </li>
                <li>
                  <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Documentation API
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Contenu principal */}
          <main className="flex-1">
            <div className="space-y-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;