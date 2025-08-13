import React, { useState } from 'react';
import SettingsSection from './SettingsSection';

interface GeneralSettingsState {
  language: string;
  theme: string;
  timezone: string;
  dateFormat: string;
}

/**
 * Composant pour les paramètres généraux
 * Gère la langue, le thème, le fuseau horaire et le format de date
 */
const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState<GeneralSettingsState>({
    language: 'fr',
    theme: 'light',
    timezone: 'Europe/Brussels',
    dateFormat: 'DD/MM/YYYY'
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof GeneralSettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    console.log('Sauvegarde des paramètres généraux:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SettingsSection
      title="Paramètres Généraux"
      description="Configurez vos préférences de base pour l'application"
    >
      {/* Langue */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Langue</label>
          <p className="text-xs text-gray-500">Choisissez votre langue préférée</p>
        </div>
        <select
          value={settings.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fr">Français</option>
          <option value="nl">Nederlands</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      {/* Thème */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Thème</label>
          <p className="text-xs text-gray-500">Apparence de l'interface</p>
        </div>
        <select
          value={settings.theme}
          onChange={(e) => handleChange('theme', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="auto">Automatique</option>
        </select>
      </div>

      {/* Fuseau horaire */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Fuseau horaire</label>
          <p className="text-xs text-gray-500">Votre fuseau horaire local</p>
        </div>
        <select
          value={settings.timezone}
          onChange={(e) => handleChange('timezone', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Europe/Brussels">Bruxelles (UTC+1)</option>
          <option value="Europe/Paris">Paris (UTC+1)</option>
          <option value="Europe/London">Londres (UTC+0)</option>
          <option value="Europe/Amsterdam">Amsterdam (UTC+1)</option>
        </select>
      </div>

      {/* Format de date */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">Format de date</label>
          <p className="text-xs text-gray-500">Comment afficher les dates</p>
        </div>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleChange('dateFormat', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
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

export default GeneralSettings;