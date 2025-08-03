import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CompanyInfo from '../components/dashboard/CompanyInfo';
import RecentSearches from '../components/dashboard/RecentSearches';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Sidebar Container */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Container */}
      <div className="flex-1 px-4 py-8 mx-4 md:mx-8 lg:mx-12">
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

export default Dashboard;