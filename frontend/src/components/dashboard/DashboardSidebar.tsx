import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLogout } from '../../contexts/LogoutContext';
import { navigationItems, getActiveItem } from '../../config/navigation';
import { SidebarHeader, NavigationItem, UserProfile } from './sidebar';

const DashboardSidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { showLogoutModal } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const activeItem = getActiveItem(location.pathname);

  const handleNavigation = (route: string) => {
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

      {/* Navigation */}
      <nav className={`flex-1 py-6 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3' : 'px-4'}`}>
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            isCollapsed={isCollapsed}
            onClick={handleNavigation}
          />
        ))}
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