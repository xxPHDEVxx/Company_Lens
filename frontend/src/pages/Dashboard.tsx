import MainContentLayout from '../components/layout/MainContentLayout';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CompanyInfo from '../components/dashboard/CompanyInfo';

const DashboardContent = () => {
  return (
    <MainContentLayout>
      {/* Welcome Section */}
      <WelcomeSection />

      {/* Company Information */}
      <CompanyInfo />
    </MainContentLayout>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;