import HeroSection from '../components/HeroSection';
import CompanyOverview from '../components/CompanyOverview';
import AnalyticsSection from '../components/AnalyticsSection';
import FeaturesSection from '../components/FeaturesSection';

const Home = () => (
  <div className="space-y-16">
    <HeroSection />
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-4xl bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8">
        <div className="grid grid-cols-2 gap-8">
          <CompanyOverview />
          <AnalyticsSection />
        </div>
      </div>
    </div>
    <FeaturesSection />
  </div>
);

export default Home; 