import MainContentLayout from '../components/layout/MainContentLayout';
import WelcomeSection from '../components/dashboard/WelcomeSection';
import CompanyInfo from '../components/dashboard/CompanyInfo';
import CompanySelection from '../components/dashboard/CompanySelection';
import { useCurrentUser } from '../hooks/queries/useAuth';

const Dashboard = () => {
  // Fetch current user data using the centralized hook
  const { data: user, isLoading, refetch } = useCurrentUser();

  if (isLoading) {
    return (
      <MainContentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </MainContentLayout>
    );
  }

  // Check if user has a company associated
  const hasCompany = user?.companyId && user.companyId !== '';

  return (
    <MainContentLayout>
      {hasCompany ? (
        <>
          <WelcomeSection />
          <CompanyInfo />
        </>
      ) : (
        <CompanySelection onCompanySelected={async () => {
          // Force refetch the user data
          await refetch();
        }} />
      )}
    </MainContentLayout>
  );
};

export default Dashboard;