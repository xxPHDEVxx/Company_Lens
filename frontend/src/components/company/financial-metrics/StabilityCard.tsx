import React from 'react';
import type { StabilityIndicator } from './types';
import { getStabilityBgColor, getStabilityTextColor, getStabilityBorderColor } from './utils';

interface StabilityCardProps {
  stability: StabilityIndicator;
}

const StabilityCard: React.FC<StabilityCardProps> = ({ stability }) => {
  const Icon = stability.icon;
  const bgColor = getStabilityBgColor(stability.color);
  const textColor = getStabilityTextColor(stability.color);
  const borderColor = getStabilityBorderColor(stability.color);

  return (
    <div className={`${bgColor} rounded-xl p-6 border ${borderColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Indicateur de Stabilité</h3>
          <p className={`text-sm ${textColor} font-medium mt-1`}>{stability.status}</p>
        </div>
        <Icon className={`h-8 w-8 ${textColor}`} />
      </div>
      
      <p className="text-sm text-gray-700 mb-4">{stability.description}</p>
      
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Facteurs Clés
        </p>
        {stability.factors.map((factor, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${bgColor === 'bg-green-50' ? 'bg-green-500' : 
              bgColor === 'bg-emerald-50' ? 'bg-emerald-500' :
              bgColor === 'bg-blue-50' ? 'bg-blue-500' :
              bgColor === 'bg-yellow-50' ? 'bg-yellow-500' :
              bgColor === 'bg-amber-50' ? 'bg-amber-500' :
              'bg-red-500'} mr-2`} />
            <p className="text-sm text-gray-700">{factor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StabilityCard;