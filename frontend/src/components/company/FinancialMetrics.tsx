import React from 'react';
import { Euro, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { 
  MetricCard, 
  StabilityCard, 
  FinancialMetricsData, 
  calculateStability 
} from './financial-metrics';

interface FinancialMetricsProps {
  metrics: FinancialMetricsData;
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ metrics }) => {
  const stability = calculateStability(metrics);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <FinancialMetricsHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard
          title="Chiffre d'Affaires"
          icon={Euro}
          iconColor="bg-blue-500"
          current={metrics.revenue.current}
          previous={metrics.revenue.previous}
          growth={metrics.revenue.growth}
          format="currency"
        />
        <MetricCard
          title="Marge"
          icon={BarChart3}
          iconColor="bg-emerald-500"
          current={metrics.margin.current}
          previous={metrics.margin.previous}
          growth={metrics.margin.growth}
          format="percentage"
        />
        <MetricCard
          title="Bénéfices"
          icon={PieChart}
          iconColor="bg-purple-500"
          current={metrics.profit.current}
          previous={metrics.profit.previous}
          growth={metrics.profit.growth}
          format="currency"
        />
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <StabilityCard stability={stability} />
      </div>
    </div>
  );
};

const FinancialMetricsHeader: React.FC = () => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-lg font-semibold text-gray-900">Indicateurs Financiers Simplifiés</h2>
    <Euro className="w-5 h-5 text-gray-400" />
  </div>
);

export default FinancialMetrics;