import React, { useState } from 'react';
import SettingsSection from './SettingsSection';

interface PrivacySettingsState {
  profileVisibility: string;
  dataSharing: boolean;
  analyticsTracking: boolean;
  marketingCommunications: boolean;
  searchHistory: boolean;
  activityLog: boolean;
  thirdPartyIntegrations: boolean;
}

/**
 * Composant pour gérer les paramètres de confidentialité
 * Contrôle le partage de données et la visibilité du profil
 */
const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState<PrivacySettingsState>({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    marketingCommunications: false,
    searchHistory: true,
    activityLog: true,
    thirdPartyIntegrations: false,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (field: keyof PrivacySettingsState) => {
    if (field === 'profileVisibility') return;
    setSettings(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
    setSaved(false);
  };

  const handleVisibilityChange = (value: string) => {
    setSettings(prev => ({ 
      ...prev, 
      profileVisibility: value 
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    console.log('Sauvegarde des paramètres de confidentialité:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Composant Toggle Switch réutilisable
  const ToggleSwitch = ({ 
    checked, 
    onChange 
  }: { 
    checked: boolean; 
    onChange: () => void; 
  }) => (
    <button
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  return (
    <SettingsSection
      title="Confidentialité"
      description="Contrôlez vos données personnelles et leur utilisation"
    >
      {/* Visibilité du profil */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Visibilité du profil
          </label>
          <p className="text-xs text-gray-500">
            Qui peut voir votre profil
          </p>
        </div>
        <select
          value={settings.profileVisibility}
          onChange={(e) => handleVisibilityChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="private">Privé</option>
          <option value="contacts">Contacts uniquement</option>
          <option value="public">Public</option>
        </select>
      </div>

      {/* Partage de données */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Partage de données anonymisées
          </label>
          <p className="text-xs text-gray-500">
            Aider à améliorer nos services avec des données anonymes
          </p>
        </div>
        <ToggleSwitch
          checked={settings.dataSharing}
          onChange={() => handleToggle('dataSharing')}
        />
      </div>

      {/* Suivi analytique */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Analyse d'utilisation
          </label>
          <p className="text-xs text-gray-500">
            Permettre le suivi pour améliorer l'expérience
          </p>
        </div>
        <ToggleSwitch
          checked={settings.analyticsTracking}
          onChange={() => handleToggle('analyticsTracking')}
        />
      </div>

      {/* Communications marketing */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Communications marketing
          </label>
          <p className="text-xs text-gray-500">
            Recevoir des offres et promotions personnalisées
          </p>
        </div>
        <ToggleSwitch
          checked={settings.marketingCommunications}
          onChange={() => handleToggle('marketingCommunications')}
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Gestion des données
        </h3>

        {/* Historique de recherche */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Conserver l'historique de recherche
            </label>
            <p className="text-xs text-gray-500">
              Sauvegarder vos recherches récentes
            </p>
          </div>
          <ToggleSwitch
            checked={settings.searchHistory}
            onChange={() => handleToggle('searchHistory')}
          />
        </div>

        {/* Journal d'activité */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Journal d'activité
            </label>
            <p className="text-xs text-gray-500">
              Enregistrer votre activité sur la plateforme
            </p>
          </div>
          <ToggleSwitch
            checked={settings.activityLog}
            onChange={() => handleToggle('activityLog')}
          />
        </div>

        {/* Intégrations tierces */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Intégrations tierces
            </label>
            <p className="text-xs text-gray-500">
              Partager des données avec des services partenaires
            </p>
          </div>
          <ToggleSwitch
            checked={settings.thirdPartyIntegrations}
            onChange={() => handleToggle('thirdPartyIntegrations')}
          />
        </div>
      </div>

      {/* Actions sur les données */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Actions sur vos données
        </h3>
        <div className="space-y-2">
          <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
            Effacer l'historique de recherche
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline block">
            Effacer le journal d'activité
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-700 hover:underline block">
            Télécharger mes données
          </button>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
        </button>
      </div>
    </SettingsSection>
  );
};

export default PrivacySettings;