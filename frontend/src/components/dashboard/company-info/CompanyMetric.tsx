import { ReactNode } from 'react';

interface CompanyMetricProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  iconBgColor?: string;
  iconColor?: string;
}

const CompanyMetric: React.FC<CompanyMetricProps> = ({
  icon,
  value,
  label,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className={`${iconBgColor} rounded-lg p-2 mr-3`}>
          <div className={`h-5 w-5 ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyMetric;