import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialData {
  year: number;
  revenue: number;
  profit: number;
  margin: number;
  employees: number;
}

interface FinancialChartsProps {
  data: FinancialData[];
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)));
  
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
          {data.map((yearData, index) => {
            const growth = index > 0 ? calculateGrowth(yearData.revenue, data[index - 1].revenue) : 0;
            return (
              <div key={yearData.year} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${(yearData.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    {formatCurrency(yearData.revenue)}
                  </span>
                  {index > 0 && (
                    <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                    </div>
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
          {data.map((yearData, index) => {
            const maxMargin = Math.max(...data.map(d => d.margin));
            const growth = index > 0 ? calculateGrowth(yearData.margin, data[index - 1].margin) : 0;
            return (
              <div key={yearData.year} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${(yearData.margin / maxMargin) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 w-24 text-right">
                    {yearData.margin.toFixed(1)}%
                  </span>
                  {index > 0 && !isNaN(growth) && isFinite(growth) && (
                    <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profit Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Bénéfices</h3>
        <div className="space-y-3">
          {data.map((yearData, index) => {
            const growth = index > 0 ? calculateGrowth(yearData.profit, data[index - 1].profit) : 0;
            const isNegative = yearData.profit < 0;
            return (
              <div key={yearData.year} className="flex items-center">
                <span className="text-sm text-gray-600 w-12">{yearData.year}</span>
                <div className="flex-1 mx-4">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isNegative ? 'bg-red-600' : 'bg-green-600'}`}
                      style={{ width: `${(Math.abs(yearData.profit) / maxProfit) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium w-24 text-right ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(yearData.profit)}
                  </span>
                  {index > 0 && !isNaN(growth) && isFinite(growth) && (
                    <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-xs ml-1">{Math.abs(growth).toFixed(1)}%</span>
                    </div>
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
            {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0) / data.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Croissance CA</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.length > 1 ? `${calculateGrowth(data[data.length - 1].revenue, data[0].revenue).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Marge Moyenne</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.length > 0 ? `${(data.reduce((sum, d) => sum + d.margin, 0) / data.length).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialCharts;