import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../../services/api';

interface UserProfileProps {
  isCollapsed: boolean;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isCollapsed, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch current user data
  const { data: user } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => authApi.getCurrentUser(),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`border-t border-slate-700/50 ${isCollapsed ? 'px-3 py-3' : 'p-4'}`}>
      <div className="relative group" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center rounded-xl hover:bg-slate-800/50 transition-all duration-300 ${
            isCollapsed ? 'py-3 justify-center' : 'px-4 py-3'
          }`}
          title={isCollapsed ? 'Profil utilisateur' : ''}
        >
          {/* Avatar Container - Always in fixed position */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
          </div>
          
          {/* User Info Container - Smooth transition */}
          <div className={`overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'
          }`}>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-white whitespace-nowrap">
                {user?.name || 'Utilisateur'}
              </p>
              <p className="text-xs text-slate-400 whitespace-nowrap truncate max-w-[150px]">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          
          {/* Chevron Icon - Only visible when expanded */}
          <div className={`overflow-hidden transition-all duration-300 flex items-center justify-center ${
            isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-4 ml-2 opacity-100'
          }`}>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Tooltip for collapsed state */}
        {isCollapsed && !isDropdownOpen && (
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-2xl border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Profil utilisateur
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        )}

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <UserDropdown
            isCollapsed={isCollapsed}
            onLogout={handleLogout}
            onClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

interface UserDropdownProps {
  isCollapsed: boolean;
  onLogout: () => void;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isCollapsed, onLogout, onClose }) => {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    navigate('/profile');
    onClose();
  };

  return (
  <div className={`absolute bg-slate-800 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-lg overflow-hidden z-[100] ${
    isCollapsed 
      ? 'left-full bottom-0 ml-3 whitespace-nowrap min-w-[200px]' 
      : 'bottom-full left-0 right-0 mb-2'
  }`}>
    <button 
      onClick={handleProfileClick}
      className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
      <div className="flex items-center space-x-3">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Mon profil</span>
      </div>
    </button>
    <div className="border-t border-slate-700/50">
      <button 
        onClick={onLogout}
        className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-all duration-200">
        <div className="flex items-center space-x-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Déconnexion</span>
        </div>
      </button>
    </div>
  </div>
  );
};

export default UserProfile;