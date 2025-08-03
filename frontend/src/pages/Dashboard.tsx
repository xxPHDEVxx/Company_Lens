import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CompanyInfo from '../components/dashboard/CompanyInfo';
import RecentSearches from '../components/dashboard/RecentSearches';
import { useSidebar } from '../contexts/SidebarContext';

const DashboardContent = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container - Dynamic left margin based on sidebar state */}
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'md:pl-32' : 'md:pl-72'
      } pr-4 md:pr-8 lg:pr-12 py-8`}>
        {/* Welcome Section */}
        <WelcomeSection />

        {/* Company Information */}
        <CompanyInfo />

        {/* Recent Searches */}
        <RecentSearches />
      </div>
    </div>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;