import { ReactComponentType } from 'react';

interface StatCardProps {
  icon: ReactComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}

const StatCard = ({ icon: Icon, label, value }: StatCardProps) => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <div className="flex items-center space-x-2">
      <Icon className="h-5 w-5 text-blue-600" />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <p className="mt-2 text-xl font-semibold text-gray-900">{value}</p>
  </div>
);

export default StatCard; 