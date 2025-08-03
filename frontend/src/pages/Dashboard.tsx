import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CompanyInfo from '../components/dashboard/CompanyInfo';
import RecentSearches from '../components/dashboard/RecentSearches';
import { useSidebar } from '../contexts/SidebarContext';

const DashboardContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 mx-auto">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Fixed centered layout with equal spacing */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:ml-28' : 'md:ml-64'
      }`}>
        <div className="px-6 md:px-8 lg:px-12 pt-20 pb-8 max-w-6xl mx-auto">
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Company Information */}
          <CompanyInfo />

          {/* Recent Searches */}
          <RecentSearches />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;