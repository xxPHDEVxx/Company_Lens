import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricCardProps } from './types';
import { formatCurrency, formatPercentage } from './utils';

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon: Icon,
  iconColor,
  current,
  previous,
  growth,
  format
}) => {
  const formatValue = format === 'currency' ? formatCurrency : (v: number) => formatPercentage(v);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(current)}
          </p>
        </div>
        <div className={`${iconColor} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          vs {formatValue(previous)}
        </p>
        <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;