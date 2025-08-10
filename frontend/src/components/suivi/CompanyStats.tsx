import type { Company } from '../../types/api';

interface CompanyStatsProps {
  followedCompanies: Company[];
}

const CompanyStats = ({ followedCompanies }: CompanyStatsProps) => {
  const recentlyUpdated = followedCompanies.filter(c => {
    if (!c.lastUpdate) return false;
    const lastUpdate = new Date(c.lastUpdate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastUpdate > weekAgo;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{followedCompanies.length}</div>
        <div className="text-sm text-gray-600">Total suivi</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {followedCompanies.filter(c => c.status === 'active').length}
        </div>
        <div className="text-sm text-gray-600">Actives</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">
          {followedCompanies.filter(c => c.status === 'inactive').length}
        </div>
        <div className="text-sm text-gray-600">Inactives</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {recentlyUpdated}
        </div>
        <div className="text-sm text-gray-600">Mises à jour récentes</div>
      </div>
    </div>
  );
};

export default CompanyStats;