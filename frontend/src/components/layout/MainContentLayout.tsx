import React from 'react';
import { Menu, X } from 'lucide-react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import { useMobileMenu } from '../../contexts/MobileMenuContext';

interface MainContentLayoutProps {
  children: React.ReactNode;
}

const MainContentLayout: React.FC<MainContentLayoutProps> = ({ children }) => {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileMenu();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 md:flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Fixed on mobile, flex item on desktop */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        transform md:transform-none transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <DashboardSidebar />
      </div>

      {/* Main Content Container - flex-1 takes remaining space on desktop */}
      <div className="flex-1 transition-all duration-300">
        <div className="dashboard-content relative">
          {/* Mobile Hamburger Button - positioned within content container */}
          <button
            className="md:hidden absolute top-2 left-0 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {children}
        </div>
      </div>
    </div>
  );
};

export default MainContentLayout;