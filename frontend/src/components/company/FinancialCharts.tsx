import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { FinancialData } from '../../types/api';

interface FinancialChartsProps {
  data: FinancialData[];
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data = [] }) => {
  // Sort data by year to ensure consistent ordering
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  const validRevenues = sortedData.filter(d => d.revenue != null && !isNaN(d.revenue) && d.revenue !== 0);
  const maxRevenue = validRevenues.length > 0
    ? Math.max(...validRevenues.map(d => d.revenue).filter((v): v is number => typeof v === 'number'))
    : 1;

  const validProfits = sortedData.filter(d => d.profit != null && !isNaN(d.profit) && d.profit !== 0);
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
          {(() => {
            // Filter only years with revenue data
            const revenueData = sortedData.filter(d => d.revenue != null && !isNaN(d.revenue) && d.revenue !== 0);

            return revenueData.map((yearData, index) => {
              const currentRevenue = yearData.revenue!;
              const previousRevenue = index > 0 ? revenueData[index - 1].revenue! : 0;
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
                      {formatCurrency(currentRevenue)}
                    </span>
                    {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                      <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                        {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="w-20"></div>
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
          {(() => {
            // Filter only years with profit data
            const profitData = sortedData.filter(d => d.profit != null && !isNaN(d.profit) && d.profit !== 0);

            return profitData.map((yearData, index) => {
              const currentProfit = yearData.profit!;
              const previousProfit = index > 0 ? profitData[index - 1].profit! : 0;
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
                      {formatCurrency(currentProfit)}
                    </span>
                    {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                      <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                        {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="w-20"></div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Total Assets Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Total Actif</h3>
        <div className="space-y-3">
          {(() => {
            // Calculate max total assets once for all items
            const validAssets = sortedData.filter(d => d.totalAssets != null && !isNaN(d.totalAssets) && d.totalAssets !== 0);
            const maxAssets = validAssets.length > 0
              ? Math.max(...validAssets.map(d => d.totalAssets!))
              : 1;

            return validAssets.map((yearData, index) => {
              const currentAssets = yearData.totalAssets!;
              const previousAssets = index > 0 ? validAssets[index - 1].totalAssets! : 0;
              const growth = index > 0 ? calculateGrowth(currentAssets, previousAssets) : 0;

              return (
                <div key={yearData.year} className="flex items-center">
                  <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: maxAssets > 0 ? `${(currentAssets / maxAssets) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 w-24 text-right">
                      {formatCurrency(currentAssets)}
                    </span>
                    {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                      <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                        {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="w-20"></div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Gross Margin Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Marge Brute</h3>
        <div className="space-y-3">
          {(() => {
            // Calculate max gross margin once for all items
            const validGrossMargins = sortedData.filter(d => d.grossMargin != null && !isNaN(d.grossMargin) && d.grossMargin !== 0);
            const maxGrossMargin = validGrossMargins.length > 0
              ? Math.max(...validGrossMargins.map(d => d.grossMargin!))
              : 1;

            return validGrossMargins.map((yearData, index) => {
              const currentGrossMargin = yearData.grossMargin!;
              const previousGrossMargin = index > 0 ? validGrossMargins[index - 1].grossMargin! : 0;
              const growth = index > 0 ? calculateGrowth(currentGrossMargin, previousGrossMargin) : 0;

              return (
                <div key={yearData.year} className="flex items-center">
                  <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full"
                        style={{ width: maxGrossMargin > 0 ? `${(currentGrossMargin / maxGrossMargin) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 w-24 text-right">
                      {formatCurrency(currentGrossMargin)}
                    </span>
                    {index > 0 && !isNaN(growth) && isFinite(growth) ? (
                      <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'} w-20`}>
                        {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                      </div>
                    ) : (
                      <div className="w-20"></div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">CA Moyen</p>
          <p className="text-lg font-semibold text-gray-900">
            {(() => {
              const validRevenues = sortedData.filter(d => d.revenue != null && !isNaN(d.revenue) && d.revenue !== 0);
              return validRevenues.length > 0
                ? formatCurrency(validRevenues.reduce((sum, d) => sum + d.revenue!, 0) / validRevenues.length)
                : 'N/A';
            })()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Croissance CA</p>
          <p className="text-lg font-semibold text-gray-900">
            {(() => {
              const validRevenues = sortedData.filter(d => d.revenue != null && !isNaN(d.revenue) && d.revenue !== 0);
              if (validRevenues.length > 1) {
                const growth = calculateGrowth(validRevenues[validRevenues.length - 1].revenue!, validRevenues[0].revenue!);
                return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
              }
              return 'N/A';
            })()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Croissance Bénéfices</p>
          <p className="text-lg font-semibold text-gray-900">
            {(() => {
              const validProfits = sortedData.filter(d => d.profit != null && !isNaN(d.profit) && d.profit !== 0);
              if (validProfits.length > 1) {
                const growth = calculateGrowth(validProfits[validProfits.length - 1].profit!, validProfits[0].profit!);
                return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
              }
              return 'N/A';
            })()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Marge Brute Moyenne</p>
          <p className="text-lg font-semibold text-gray-900">
            {sortedData.length > 0 ? (() => {
              const validGrossMargins = sortedData.filter(d => d.grossMargin != null && !isNaN(d.grossMargin) && d.grossMargin !== 0);
              return validGrossMargins.length > 0
                ? formatCurrency(validGrossMargins.reduce((sum, d) => sum + d.grossMargin!, 0) / validGrossMargins.length)
                : 'N/A';
            })() : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;