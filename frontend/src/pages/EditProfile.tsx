import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainContentLayout from '../components/layout/MainContentLayout';
import {
  PersonalInfoForm,
  CompanyInfoForm,
  LocationForm,
  PasswordChangeForm,
  FormActions
} from '../components/editProfile';
import { useCurrentUser } from '../hooks/queries/useAuth';

/**
 * Interface pour les données du formulaire de profil
 */
interface ProfileFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Informations professionnelles
  companyName: string;
  role: string;
  department: string;
  vatNumber: string;
  // Localisation
  street: string;
  number: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  // Mot de passe
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Page de modification du profil utilisateur
 * Permet de modifier toutes les informations personnelles et professionnelles
 */
const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  // État du formulaire
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    role: '',
    department: '',
    vatNumber: '',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    region: '',
    country: 'Belgique',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // État des erreurs de validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // États de l'interface
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Données initiales pour détecter les changements
  const [initialData, setInitialData] = useState<ProfileFormData>(formData);

  // Charger les données utilisateur au montage
  useEffect(() => {
    if (user) {
      const userData: ProfileFormData = {
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: '+32 2 123 45 67', // Données simulées
        companyName: 'TechVision SA',
        role: 'Administrateur',
        department: 'direction',
        vatNumber: 'BE0123456789',
        street: 'Rue de la Loi',
        number: '42',
        postalCode: '1000',
        city: 'Bruxelles',
        region: 'bruxelles',
        country: 'Belgique',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      setFormData(userData);
      setInitialData(userData);
    }
  }, [user]);

  // Détecter les changements dans le formulaire
  useEffect(() => {
    const hasFormChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasChanges(hasFormChanges);
  }, [formData, initialData]);

  // Gérer les changements de champs
  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ lors de la modification
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation des champs obligatoires
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    // Validation du numéro TVA belge
    if (formData.vatNumber && !/^BE[0-9]{10}$/.test(formData.vatNumber)) {
      newErrors.vatNumber = 'Format invalide (BE suivi de 10 chiffres)';
    }

    // Validation du code postal belge
    if (formData.postalCode && !/^[0-9]{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Le code postal doit contenir 4 chiffres';
    }

    // Validation du mot de passe si changement
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Le mot de passe actuel est requis';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe est requis';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    // Effacer les messages précédents
    setSuccessMessage('');
    setErrorMessage('');

    // Valider le formulaire
    if (!validateForm()) {
      setErrorMessage('Veuillez corriger les erreurs dans le formulaire');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Succès
      setSuccessMessage('Vos modifications ont été sauvegardées avec succès');
      setInitialData(formData);
      setHasChanges(false);
      
      // Réinitialiser les mots de passe
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Rediriger après succès
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setErrorMessage('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setFormData(initialData);
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    setHasChanges(false);
  };

  // Gérer les raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+S ou Cmd+S pour sauvegarder
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !isSubmitting) {
          handleSave();
        }
      }
      // Échap pour annuler
      if (e.key === 'Escape' && hasChanges) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasChanges, isSubmitting]);

  return (
    <MainContentLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifier le Profil</h1>
              <p className="text-gray-600 mt-2">
                Mettez à jour vos informations personnelles et professionnelles
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Formulaires */}
        <form onSubmit={(e) => e.preventDefault()}>
          <PersonalInfoForm
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone
            }}
            errors={errors}
            onChange={handleFieldChange}
          />

          <CompanyInfoForm
            formData={{
              companyName: formData.companyName,
              role: formData.role,
              department: formData.department,
              vatNumber: formData.vatNumber
            }}
            errors={errors}
            onChange={handleFieldChange}
          />

          <LocationForm
            formData={{
              street: formData.street,
              number: formData.number,
              postalCode: formData.postalCode,
              city: formData.city,
              region: formData.region,
              country: formData.country
            }}
            errors={errors}
            onChange={handleFieldChange}
          />

          <PasswordChangeForm
            formData={{
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
              confirmPassword: formData.confirmPassword
            }}
            errors={errors}
            onChange={handleFieldChange}
          />

          <FormActions
            isSubmitting={isSubmitting}
            hasChanges={hasChanges}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </form>
      </div>
    </MainContentLayout>
  );
};

export default EditProfile;