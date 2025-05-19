import { CurrencyEuroIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import CompanyHeader from './CompanyHeader';
import StatCard from './StatCard';

const CompanyOverview = () => (
  <div className="space-y-6">
    <CompanyHeader />
    <div className="grid grid-cols-2 gap-4">
      <StatCard icon={CurrencyEuroIcon} label="Chiffre d'affaires" value="€2.5M" />
      <StatCard icon={UserGroupIcon} label="Employés" value="45" />
    </div>
  </div>
);

export default CompanyOverview; 