import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { FinancialData } from '../../types/api';

interface FinancialChartsProps {
  data: FinancialData[];
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data = [] }) => {
  // Sort data by year to ensure consistent ordering
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  
  const validRevenues = sortedData.filter(d => d.revenue != null && !isNaN(d.revenue));
  const maxRevenue = validRevenues.length > 0
    ? Math.max(...validRevenues.map(d => d.revenue).filter((v): v is number => typeof v === 'number'))
    : 1;
  
  const validProfits = sortedData.filter(d => d.profit != null && !isNaN(d.profit));
  const maxProfit = validProfits.length > 0
    ? Math.max(...validProfits.map(d => d.profit).filter((v): v is number => typeof v === 'number').map(Math.abs))
    : 1;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Données Financières</h2>
      
      {/* Revenue Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Chiffre d'Affaires</h3>
        <div className="space-y-3">
          {sortedData.map((yearData, index) => {
            const currentRevenue = yearData.revenue ?? 0;
            const previousRevenue = index > 0 ? (sortedData[index - 1].revenue ?? 0) : 0;
            const growth = index > 0 ? calculateGrowth(currentRevenue, previousRevenue) : 0;
            
            return (
              <div key={yearData.year} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: maxRevenue > 0 ? `${(currentRevenue / maxRevenue) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    {currentRevenue != null ? formatCurrency(currentRevenue) : 'N/A'}
                  </span>
                  {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                    <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                      {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="w-20"></div> // Empty placeholder for consistent width
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Margin Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Marge</h3>
        <div className="space-y-3">
          {(() => {
            // Calculate max margin once for all items
            const validMargins = sortedData.filter(d => d.margin != null && !isNaN(d.margin));
            const maxMargin = validMargins.length > 0 ? Math.max(...validMargins.map(d => d.margin!)) : 100;
            
            return sortedData.map((yearData, index) => {
              const currentMargin = yearData.margin ?? 0;
              const previousMargin = index > 0 ? (sortedData[index - 1].margin ?? 0) : 0;
              const growth = index > 0 ? calculateGrowth(currentMargin, previousMargin) : 0;
            
            return (
              <div key={yearData.year} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: maxMargin > 0 ? `${(currentMargin / maxMargin) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    {currentMargin != null ? `${currentMargin.toFixed(1)}%` : 'N/A'}
                  </span>
                  {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                    <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                      {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="w-20"></div> // Empty placeholder for consistent width
                  )}
                </div>
              </div>
            );
            });
          })()}
        </div>
      </div>

      {/* Profit Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Bénéfices</h3>
        <div className="space-y-3">
          {sortedData.map((yearData, index) => {
            const currentProfit = yearData.profit ?? 0;
            const previousProfit = index > 0 ? (sortedData[index - 1].profit ?? 0) : 0;
            const growth = index > 0 ? calculateGrowth(currentProfit, previousProfit) : 0;
            const isNegative = currentProfit < 0;
            
            return (
              <div key={yearData.year} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isNegative ? 'bg-red-600' : 'bg-green-600'}`}
                      style={{ width: maxProfit > 0 ? `${(Math.abs(currentProfit) / maxProfit) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium w-24 text-right ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                    {currentProfit != null ? formatCurrency(currentProfit) : 'N/A'}
                  </span>
                  {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                    <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                      {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="w-20"></div> // Empty placeholder for consistent width
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">CA Moyen</p>
          <p className="text-lg font-semibold text-gray-900">
            {(() => {
              const validRevenues = sortedData.filter(d => d.revenue != null && !isNaN(d.revenue));
              return validRevenues.length > 0
                ? formatCurrency(validRevenues.reduce((sum, d) => sum + d.revenue!, 0) / validRevenues.length)
                : 'N/A';
            })()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Croissance CA</p>
          <p className="text-lg font-semibold text-gray-900">
            {sortedData.length > 1 && sortedData[0].revenue != null && sortedData[sortedData.length - 1].revenue != null
              ? (() => {
                const growth = calculateGrowth(sortedData[sortedData.length - 1].revenue!, sortedData[0].revenue!);
                return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
              })()
              : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Marge Moyenne</p>
          <p className="text-lg font-semibold text-gray-900">
            {sortedData.length > 0 ? (() => {
              const validMargins = sortedData.filter(d => d.margin != null && !isNaN(d.margin));
              return validMargins.length > 0
                ? `${(validMargins.reduce((sum, d) => sum + d.margin!, 0) / validMargins.length).toFixed(1)}%`
                : 'N/A';
            })() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;