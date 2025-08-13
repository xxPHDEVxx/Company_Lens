import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  isSubmitting: boolean;
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Actions du formulaire (Sauvegarder, Annuler)
 * Gère les boutons d'action avec états de soumission
 */
const FormActions: React.FC<FormActionsProps> = ({ 
  isSubmitting, 
  hasChanges,
  onSave, 
  onCancel 
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm(
        'Des modifications non sauvegardées seront perdues. Voulez-vous continuer ?'
      );
      if (confirmCancel) {
        onCancel();
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        {/* Message d'information */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {hasChanges 
              ? 'Des modifications non sauvegardées sont en attente' 
              : 'Aucune modification en cours'}
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4">
          {/* Bouton Annuler */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
            </svg>
            Annuler
          </button>

          {/* Bouton Sauvegarder */}
          <button
            type="button"
            onClick={onSave}
            disabled={isSubmitting || !hasChanges}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
              hasChanges && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M5 13l4 4L19 7" />
                </svg>
                Sauvegarder les modifications
              </>
            )}
          </button>
        </div>
      </div>

      {/* Raccourcis clavier */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <span className="font-medium">Raccourcis :</span> 
          <kbd className="mx-1 px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Ctrl</kbd>
          +
          <kbd className="mx-1 px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">S</kbd>
          pour sauvegarder,
          <kbd className="mx-1 px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Esc</kbd>
          pour annuler
        </p>
      </div>
    </div>
  );
};

export default FormActions;