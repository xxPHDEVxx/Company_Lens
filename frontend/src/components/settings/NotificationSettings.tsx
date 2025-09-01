import React, { useState } from 'react';
import SettingsSection from './SettingsSection';

interface NotificationSettingsState {
  emailNotifications: boolean;
  emailFrequency: string;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  companyUpdates: boolean;
  weeklyReport: boolean;
  monthlyNewsletter: boolean;
  securityAlerts: boolean;
}

/**
 * Composant pour gérer les paramètres de notifications
 * Contrôle les emails, notifications push et dans l'application
 */
const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsState>({
    emailNotifications: true,
    emailFrequency: 'immediate',
    pushNotifications: false,
    inAppNotifications: true,
    companyUpdates: true,
    weeklyReport: true,
    monthlyNewsletter: false,
    securityAlerts: true,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (field: keyof NotificationSettingsState) => {
    setSettings(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
    setSaved(false);
  };

  const handleFrequencyChange = (value: string) => {
    setSettings(prev => ({ 
      ...prev, 
      emailFrequency: value 
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    console.log('Sauvegarde des paramètres de notification:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Composant Toggle Switch réutilisable
  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean;
  }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
      title="Notifications"
      description="Gérez comment et quand vous recevez des notifications"
    >
      {/* Notifications par email */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Notifications par email
            </label>
            <p className="text-xs text-gray-500">
              Recevoir des notifications par email
            </p>
          </div>
          <ToggleSwitch
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
        </div>

        {/* Fréquence des emails */}
        {settings.emailNotifications && (
          <div className="ml-8 flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Fréquence des emails
              </label>
              <p className="text-xs text-gray-500">
                Quand recevoir les notifications
              </p>
            </div>
            <select
              value={settings.emailFrequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immédiatement</option>
              <option value="daily">Résumé quotidien</option>
              <option value="weekly">Résumé hebdomadaire</option>
            </select>
          </div>
        )}
      </div>

      {/* Notifications push */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Notifications push
          </label>
          <p className="text-xs text-gray-500">
            Notifications sur votre appareil
          </p>
        </div>
        <ToggleSwitch
          checked={settings.pushNotifications}
          onChange={() => handleToggle('pushNotifications')}
        />
      </div>

      {/* Notifications dans l'application */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Notifications dans l'application
          </label>
          <p className="text-xs text-gray-500">
            Afficher les notifications dans l'interface
          </p>
        </div>
        <ToggleSwitch
          checked={settings.inAppNotifications}
          onChange={() => handleToggle('inAppNotifications')}
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Types de notifications
        </h3>

        {/* Mises à jour d'entreprises */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mises à jour d'entreprises
            </label>
            <p className="text-xs text-gray-500">
              Changements sur les entreprises suivies
            </p>
          </div>
          <ToggleSwitch
            checked={settings.companyUpdates}
            onChange={() => handleToggle('companyUpdates')}
          />
        </div>

        {/* Rapport hebdomadaire */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Rapport hebdomadaire
            </label>
            <p className="text-xs text-gray-500">
              Résumé de vos activités de la semaine
            </p>
          </div>
          <ToggleSwitch
            checked={settings.weeklyReport}
            onChange={() => handleToggle('weeklyReport')}
          />
        </div>

        {/* Newsletter mensuelle */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Newsletter mensuelle
            </label>
            <p className="text-xs text-gray-500">
              Actualités et nouvelles fonctionnalités
            </p>
          </div>
          <ToggleSwitch
            checked={settings.monthlyNewsletter}
            onChange={() => handleToggle('monthlyNewsletter')}
          />
        </div>

        {/* Alertes de sécurité */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Alertes de sécurité
            </label>
            <p className="text-xs text-gray-500">
              Connexions inhabituelles et activités suspectes
            </p>
          </div>
          <ToggleSwitch
            checked={settings.securityAlerts}
            onChange={() => handleToggle('securityAlerts')}
          />
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

export default NotificationSettings;