import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLogout } from '../../contexts/LogoutContext';
import { navigationItems, getActiveItem } from '../../config/navigation';
import { SidebarHeader, NavigationItem, UserProfile } from './sidebar';
import { authApi } from '../../services/api';
import { Lock } from 'lucide-react';

const DashboardSidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { showLogoutModal } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data to check if they have a company
  const { data: user } = useQuery({
    queryKey: ['user', 'current'],
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 0, // Always refetch when the query is invalidated
    refetchOnWindowFocus: true,
  });

  const hasCompany = user?.companyId && user.companyId !== '';
  const activeItem = getActiveItem(location.pathname);

  const handleNavigation = (route: string) => {
    // Only allow navigation to dashboard if user doesn't have a company
    if (!hasCompany && route !== '/dashboard') {
      // Show a toast or alert that they need to add a company first
      navigate('/dashboard');
      return;
    }
    navigate(route);
  };
  
  const handleLogout = () => {
    showLogoutModal();
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col shadow-2xl backdrop-blur-lg border-r border-slate-700/50 transition-all duration-300 ease-in-out z-50 ${
      isCollapsed ? 'w-28' : 'w-64'
    }`}>
      {/* Header with Logo and Toggle */}
      <SidebarHeader 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* Warning message if no company */}
      {!hasCompany && !isCollapsed && (
        <div className="mx-4 mb-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400">
            <Lock className="h-4 w-4 flex-shrink-0" />
            <p className="text-xs">
              Ajoutez votre entreprise pour débloquer toutes les fonctionnalités
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 py-6 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {navigationItems.map((item) => {
          const isLocked = !hasCompany && item.id !== 'dashboard';
          
          return (
            <div key={item.id} className="relative">
              <NavigationItem
                item={item}
                isActive={activeItem === item.id}
                isCollapsed={isCollapsed}
                onClick={handleNavigation}
                disabled={isLocked}
              />
              {isLocked && (
                <div className={`absolute inset-0 bg-slate-900/50 rounded-lg flex items-center ${
                  isCollapsed ? 'justify-center' : 'justify-end pr-4'
                } pointer-events-none`}>
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section - Profile */}
      <UserProfile 
        isCollapsed={isCollapsed} 
        onLogout={handleLogout} 
      />
    </div>
  );
};

export default DashboardSidebar;