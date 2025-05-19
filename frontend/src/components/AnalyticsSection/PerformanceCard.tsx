import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import ProgressBar from './ProgressBar';

const PerformanceCard = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-medium text-gray-900">Performance</h4>
      <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
    </div>
    <div className="space-y-3">
      <ProgressBar label="Croissance" value={75} color="green" />
      <ProgressBar label="Stabilité" value={92} color="blue" />
    </div>
  </div>
);

export default PerformanceCard; 