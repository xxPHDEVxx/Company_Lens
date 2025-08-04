import React from 'react';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import { useSidebar } from '../../contexts/SidebarContext';

interface MainContentLayoutProps {
  children: React.ReactNode;
}

const MainContentLayout: React.FC<MainContentLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container with consistent styling */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:ml-28' : 'md:ml-64'
      }`}>
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainContentLayout;