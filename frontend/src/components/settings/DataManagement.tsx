import React, { useState } from 'react';
import SettingsSection from './SettingsSection';

/**
 * Composant pour gérer les données utilisateur
 * Export de données et suppression de compte
 */
const DataManagement: React.FC = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleExportData = (format: 'json' | 'csv' | 'pdf') => {
    setExportLoading(true);
    // Simulation d'export
    setTimeout(() => {
      console.log(`Export des données en format ${format}`);
      setExportLoading(false);
      alert(`Vos données ont été exportées en format ${format.toUpperCase()}`);
    }, 2000);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'SUPPRIMER') {
      console.log('Suppression du compte confirmée');
      // Logique de suppression du compte
      alert('Votre demande de suppression a été enregistrée.');
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <>
      {/* Export de données */}
      <SettingsSection
        title="Export de données"
        description="Téléchargez une copie de toutes vos données"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous pouvez télécharger toutes vos données stockées sur Company Lens.
            Cela inclut votre profil, vos recherches, vos entreprises suivies et vos groupes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Export JSON */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Format JSON</h4>
              <p className="text-xs text-gray-500 mb-3">
                Format technique complet pour développeurs
              </p>
              <button
                onClick={() => handleExportData('json')}
                disabled={exportLoading}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {exportLoading ? 'Préparation...' : 'Exporter JSON'}
              </button>
            </div>

            {/* Export CSV */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Format CSV</h4>
              <p className="text-xs text-gray-500 mb-3">
                Format tableur pour Excel ou Google Sheets
              </p>
              <button
                onClick={() => handleExportData('csv')}
                disabled={exportLoading}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {exportLoading ? 'Préparation...' : 'Exporter CSV'}
              </button>
            </div>

            {/* Export PDF */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Format PDF</h4>
              <p className="text-xs text-gray-500 mb-3">
                Document lisible pour archivage
              </p>
              <button
                onClick={() => handleExportData('pdf')}
                disabled={exportLoading}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {exportLoading ? 'Préparation...' : 'Exporter PDF'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              ℹ️ L'export peut prendre quelques minutes selon la quantité de données.
              Vous recevrez un email avec le lien de téléchargement une fois prêt.
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Suppression de compte */}
      <SettingsSection
        title="Suppression de compte"
        description="Supprimer définitivement votre compte et toutes vos données"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-900 mb-2">
              ⚠️ Zone dangereuse
            </h4>
            <p className="text-sm text-red-700 mb-3">
              La suppression de votre compte est irréversible. Toutes vos données seront 
              définitivement effacées, incluant :
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              <li>Votre profil et informations personnelles</li>
              <li>Votre historique de recherche</li>
              <li>Vos entreprises suivies</li>
              <li>Vos groupes créés</li>
              <li>Vos préférences et paramètres</li>
            </ul>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="border border-red-300 rounded-lg p-4 bg-red-50">
              <h4 className="font-medium text-red-900 mb-3">
                Confirmer la suppression
              </h4>
              <p className="text-sm text-red-700 mb-3">
                Pour confirmer la suppression de votre compte, tapez{' '}
                <span className="font-mono font-bold">SUPPRIMER</span> dans le champ ci-dessous :
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Tapez SUPPRIMER"
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'SUPPRIMER'}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Alternatives à la suppression
            </h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">
                • <strong>Désactiver temporairement :</strong> Votre compte sera masqué mais vos données préservées
              </li>
              <li className="text-sm text-gray-600">
                • <strong>Effacer l'historique :</strong> Supprimer uniquement votre historique de recherche
              </li>
              <li className="text-sm text-gray-600">
                • <strong>Réinitialiser les préférences :</strong> Remettre tous les paramètres par défaut
              </li>
            </ul>
          </div>
        </div>
      </SettingsSection>
    </>
  );
};

export default DataManagement;