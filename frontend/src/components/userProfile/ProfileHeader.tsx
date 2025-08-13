import React from 'react';

interface ProfileHeaderProps {
  userName: string;
  userEmail: string;
}

/**
 * En-tête du profil utilisateur avec avatar et informations principales
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userName, userEmail }) => {
  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
      <div className="flex items-center space-x-6">
        {/* Avatar avec les initiales */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">
              {getInitials(userName)}
            </span>
          </div>
          {/* Badge de statut en ligne */}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
        </div>

        {/* Informations utilisateur */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{userName}</h1>
          <p className="text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {userEmail}
          </p>
        </div>

        {/* Bouton d'édition du profil */}
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Modifier le profil</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;