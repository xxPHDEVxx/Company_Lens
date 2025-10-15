import React from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { ProfileHeader, ProfileInfo} from '../components/userProfile';
import { useCurrentUser } from '../hooks/queries/useAuth';

/**
 * Page de profil utilisateur
 * Affiche les informations détaillées de l'utilisateur connecté
 */
const UserProfile: React.FC = () => {
  // Récupérer les données de l'utilisateur connecté
  const { data: user } = useCurrentUser();

  return (
    <MainContentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">
            Consultez vos informations personnelles
          </p>
        </div>

        {/* En-tête du profil avec avatar et nom */}
        <ProfileHeader
          userName={user?.name || 'Utilisateur'}
          userEmail={user?.email || 'user@example.com'}
        />

        {/* Informations détaillées du profil */}
        {user && user.date_joined && (
          <ProfileInfo
            memberSince={user.date_joined}
            companyName={user.company_name}
            phone={user.phone}
          />
        )}
      </div>
    </MainContentLayout>
  );
};

export default UserProfile;