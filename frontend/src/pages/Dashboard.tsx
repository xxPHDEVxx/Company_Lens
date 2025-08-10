import MainContentLayout from '../components/layout/MainContentLayout';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CompanyInfo from '../components/dashboard/CompanyInfo';

const Dashboard = () => {
  return (
    <MainContentLayout>
      <WelcomeSection />
      <CompanyInfo />
    </MainContentLayout>
  );
};

export default Dashboard;