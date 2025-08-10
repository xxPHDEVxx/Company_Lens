import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLogout } from '../../contexts/LogoutContext';
import { navigationItems, getActiveItem } from '../../config/navigation';

const DashboardSidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { showLogoutModal } = useLogout();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = getActiveItem(location.pathname);

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


  const handleNavigation = (route: string) => {
    navigate(route);
  };
  
  const handleLogout = () => {
    setIsDropdownOpen(false);
    showLogoutModal();
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shadow-2xl backdrop-blur-lg border-r border-slate-700/50 transition-all duration-300 ease-in-out z-50 ${
      isCollapsed ? 'w-28' : 'w-64'
    }`}>
      {/* Header with Logo and Toggle */}
      <div className="relative border-b border-slate-700/50 h-20">
        {/* Expand button when collapsed - absolute positioned */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-6 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
            title="Agrandir la barre latérale"
          >
            <svg 
              className="w-3 h-3 text-slate-400 hover:text-white transition-colors duration-300 rotate-180"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="h-full flex items-center">
          {isCollapsed ? (
            /* Collapsed: */
            <div className="w-full grid items-center h-full">
              <div className="flex justify-center">
                <Link to="/dashboard" className="flex items-center group">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      <path d="M12 6.5c-.83 0-1.5.67-1.5 1.5h-2c0-1.93 1.57-3.5 3.5-3.5v2z"/>
                      <path d="M8 12c0 .83.67 1.5 1.5 1.5v2c-1.93 0-3.5-1.57-3.5-3.5h2z"/>
                      <path d="M12 17.5c.83 0 1.5-.67 1.5-1.5h2c0 1.93-1.57 3.5-3.5 3.5v-2z"/>
                      <path d="M16 12c0-.83-.67-1.5-1.5-1.5v-2c1.93 0 3.5 1.57 3.5 3.5h-2z"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            /* Expanded: Regular flex layout */
            <div className="w-full flex items-center justify-between px-4 h-full">
              <Link to="/dashboard" className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <path d="M12 6.5c-.83 0-1.5.67-1.5 1.5h-2c0-1.93 1.57-3.5 3.5-3.5v2z"/>
                    <path d="M8 12c0 .83.67 1.5 1.5 1.5v2c-1.93 0-3.5-1.57-3.5-3.5h2z"/>
                    <path d="M12 17.5c.83 0 1.5-.67 1.5-1.5h2c0 1.93-1.57 3.5-3.5 3.5v-2z"/>
                    <path d="M16 12c0-.83-.67-1.5-1.5-1.5v-2c1.93 0 3.5 1.57 3.5 3.5h-2z"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <span className="ml-3 text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                  CompanyLens
                </span>
              </Link>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-6 h-6 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                title="Réduire la barre latérale"
              >
                <svg 
                  className="w-3 h-3 text-slate-400 hover:text-white transition-all duration-300"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-6 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {navigationItems.map((item) => (
          <div key={item.id} className="relative group mb-2">
            <button
              onClick={() => handleNavigation(item.route)}
              className={`w-full flex items-center rounded-xl transition-all duration-300 relative ${
                isCollapsed ? 'py-3 justify-center' : 'px-4 py-3'
              } ${
                activeItem === item.id
                  ? item.activeColor.split(' ')[0] + ' shadow-lg'
                  : 'hover:bg-slate-700/50'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              {/* Icon Container - Always in fixed position */}
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                <span
                  className={`transition-colors duration-300 ${
                    activeItem === item.id
                      ? item.activeColor.includes('text-') ? item.activeColor.split(' ')[1] : ''
                      : `text-slate-400 ${item.iconHoverColor}`
                  }`}
                >
                  {item.icon}
                </span>
              </div>
              
              {/* Text Container - Smooth transition */}
              <div className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'
              }`}>
                <span className={`font-medium text-sm whitespace-nowrap ${
                  activeItem === item.id ? 'text-white' : 'text-slate-300'
                }`}>
                  {item.label}
                </span>
              </div>
              
              {/* Active indicator bar */}
              {activeItem === item.id && (
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 ${item.indicatorColor} rounded-r-full transition-all duration-300`} />
              )}
            </button>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-2xl border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {item.label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section - Profile */}
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
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            {/* User Info Container - Smooth transition */}
            <div className={`overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'
            }`}>
              <div className="text-left flex-1">
                <p className="text-sm font-medium text-white whitespace-nowrap">Utilisateur</p>
                <p className="text-xs text-slate-400 whitespace-nowrap">user@example.com</p>
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
            <div className={`absolute bg-slate-800 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-lg overflow-hidden z-[100] ${
              isCollapsed 
                ? 'left-full bottom-0 ml-3 whitespace-nowrap min-w-[200px]' 
                : 'bottom-full left-0 right-0 mb-2'
            }`}>
              <button className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Mon profil</span>
                </div>
              </button>
              <button className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Paramètres</span>
                </div>
              </button>
              <div className="border-t border-slate-700/50">
                <button 
                  onClick={handleLogout}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;