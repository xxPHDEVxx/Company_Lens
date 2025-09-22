import React, { useState } from 'react';
import SettingsSection from './SettingsSection';

interface SecuritySettingsState {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
  deviceManagement: boolean;
  passwordExpiry: boolean;
  biometricAuth: boolean;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

/**
 * Composant pour gérer les paramètres de sécurité
 * Authentification à deux facteurs, gestion des sessions et alertes
 */
const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettingsState>({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true,
    deviceManagement: true,
    passwordExpiry: false,
    biometricAuth: false,
  });

  const [saved, setSaved] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Sessions actives simulées
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome - Windows',
      location: 'Bruxelles, Belgique',
      lastActive: 'Actuellement actif',
      current: true,
    },
    {
      id: '2',
      device: 'Safari - iPhone',
      location: 'Anvers, Belgique',
      lastActive: 'Il y a 2 heures',
      current: false,
    },
  ]);

  const handleToggle = (field: keyof SecuritySettingsState) => {
    setSettings(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
    setSaved(false);
  };

  const handleTimeoutChange = (value: string) => {
    setSettings(prev => ({ 
      ...prev, 
      sessionTimeout: value 
    }));
    setSaved(false);
  };

  const handleSave = () => {
    // Simulation de sauvegarde
    console.log('Sauvegarde des paramètres de sécurité:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRevokeSession = (sessionId: string) => {
    console.log('Révocation de la session:', sessionId);
    // Logique pour révoquer une session
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
      title="Sécurité"
      description="Protégez votre compte avec des paramètres de sécurité avancés"
    >
      {/* Authentification à deux facteurs */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Authentification à deux facteurs
          </label>
          <p className="text-xs text-gray-500">
            Ajouter une couche de sécurité supplémentaire
          </p>
        </div>
        <ToggleSwitch
          checked={settings.twoFactorAuth}
          onChange={() => handleToggle('twoFactorAuth')}
        />
      </div>

      {/* Configuration 2FA si activé */}
      {settings.twoFactorAuth && (
        <div className="ml-8 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800 mb-2">
            Configuration de l'authentification à deux facteurs
          </p>
          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            Configurer 2FA
          </button>
        </div>
      )}

      {/* Expiration de session */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Expiration de session
          </label>
          <p className="text-xs text-gray-500">
            Déconnexion automatique après inactivité
          </p>
        </div>
        <select
          value={settings.sessionTimeout}
          onChange={(e) => handleTimeoutChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 heure</option>
          <option value="120">2 heures</option>
          <option value="never">Jamais</option>
        </select>
      </div>

      {/* Alertes de connexion */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Alertes de connexion
          </label>
          <p className="text-xs text-gray-500">
            Recevoir une notification lors de nouvelles connexions
          </p>
        </div>
        <ToggleSwitch
          checked={settings.loginAlerts}
          onChange={() => handleToggle('loginAlerts')}
        />
      </div>

      {/* Gestion des appareils */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Gestion des appareils
          </label>
          <p className="text-xs text-gray-500">
            Surveiller et gérer les appareils connectés
          </p>
        </div>
        <ToggleSwitch
          checked={settings.deviceManagement}
          onChange={() => handleToggle('deviceManagement')}
        />
      </div>

      {/* Expiration du mot de passe */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Expiration du mot de passe
          </label>
          <p className="text-xs text-gray-500">
            Demander un changement de mot de passe tous les 90 jours
          </p>
        </div>
        <ToggleSwitch
          checked={settings.passwordExpiry}
          onChange={() => handleToggle('passwordExpiry')}
        />
      </div>

      {/* Authentification biométrique */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Authentification biométrique
          </label>
          <p className="text-xs text-gray-500">
            Utiliser Face ID ou Touch ID sur les appareils compatibles
          </p>
        </div>
        <ToggleSwitch
          checked={settings.biometricAuth}
          onChange={() => handleToggle('biometricAuth')}
        />
      </div>

      {/* Changement de mot de passe */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Mot de passe
        </h3>
        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Changer le mot de passe
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Mot de passe actuel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Mettre à jour
              </button>
              <button
                onClick={() => setShowPasswordChange(false)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sessions actives */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Sessions actives
        </h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {session.device}
                </p>
                <p className="text-xs text-gray-500">
                  {session.location} • {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Révoquer
                </button>
              )}
              {session.current && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Session actuelle
                </span>
              )}
            </div>
          ))}
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

export default SecuritySettings;