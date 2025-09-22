import React from 'react';
import MainContentLayout from '../components/layout/MainContentLayout';
import { ProfileHeader, ProfileInfo, ProfileStats } from '../components/userProfile';
import { useCurrentUser } from '../hooks/queries/useAuth';

/**
 * Page de profil utilisateur
 * Affiche les informations d�taill�es et les statistiques de l'utilisateur connect�
 */
const UserProfile: React.FC = () => {
  // R�cup�rer les donn�es de l'utilisateur connect�
  const { data: user } = useCurrentUser();

  // Donn�es simul�es pour les statistiques (� remplacer par de vraies donn�es API)
  const mockStats = {
    companiesFollowed: 12,
    groupsCreated: 3,
    recentSearches: 28,
    lastActivity: new Date().toISOString(),
    memberSince: '2024-01-15',
    companyName: 'TechVision SA',
    role: 'Administrateur',
    phone: '+32 2 123 45 67',
    location: 'Bruxelles, Belgique'
  };

  return (
    <MainContentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et consultez votre activité
          </p>
        </div>

        {/* En-t�te du profil avec avatar et nom */}
        <ProfileHeader 
          userName={user?.name || 'Utilisateur'} 
          userEmail={user?.email || 'user@example.com'} 
        />

        {/* Informations d�taill�es du profil */}
        <ProfileInfo
          memberSince={mockStats.memberSince}
          companyName={mockStats.companyName}
          role={mockStats.role}
          phone={mockStats.phone}
          location={mockStats.location}
        />

        {/* Statistiques et activit� */}
        <ProfileStats
          companiesFollowed={mockStats.companiesFollowed}
          groupsCreated={mockStats.groupsCreated}
          recentSearches={mockStats.recentSearches}
          lastActivity={mockStats.lastActivity}
        />

        {/* Section des actions rapides */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Paramètres</p>
                  <p className="text-sm text-gray-500">Gérer les préférences</p>
                </div>
              </div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sécurité</p>
                  <p className="text-sm text-gray-500">Mot de passe et accès</p>
                </div>
              </div>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 text-left">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">Alertes et emails</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </MainContentLayout>
  );
};

export default UserProfile;