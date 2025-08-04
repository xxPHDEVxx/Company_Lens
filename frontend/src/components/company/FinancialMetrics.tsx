import React from 'react';
import { TrendingUp, TrendingDown, Euro, Shield, AlertTriangle, Activity } from 'lucide-react';

interface SimpleMetric {
  current: number;
  previous: number;
  growth: number;
}

interface FinancialMetricsProps {
  metrics: {
    revenue: SimpleMetric;
    margin: SimpleMetric;
    profit: SimpleMetric;
  };
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ metrics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-BE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Define stability color type
  type StabilityColor = 'green' | 'emerald' | 'blue' | 'yellow' | 'amber' | 'red';
  
  // Calculate stability indicator
  const calculateStability = () => {
    const { revenue, margin, profit } = metrics;
    
    // Calculate volatility based on the magnitude of changes
    const revenueVolatility = Math.abs(revenue.growth);
    const marginVolatility = Math.abs(margin.growth);
    const profitVolatility = Math.abs(profit.growth);
    
    // Check for consistent trends
    const allPositive = revenue.growth >= 0 && margin.growth >= 0 && profit.growth >= 0;
    const allNegative = revenue.growth < 0 && margin.growth < 0 && profit.growth < 0;
    const avgGrowth = (revenue.growth + margin.growth + profit.growth) / 3;
    const avgVolatility = (revenueVolatility + marginVolatility + profitVolatility) / 3;
    
    // Determine stability status
    if (allPositive && avgGrowth > 5 && avgVolatility < 15) {
      return {
        status: 'Croissance Stable',
        color: 'green' as StabilityColor,
        icon: TrendingUp,
        description: 'Tous les indicateurs montrent une croissance soutenue et régulière.',
        factors: ['Croissance positive constante', 'Faible volatilité', 'Tendance haussière confirmée']
      };
    } else if (allPositive && avgGrowth > 0) {
      return {
        status: 'En Croissance',
        color: 'emerald' as StabilityColor,
        icon: TrendingUp,
        description: 'Performance positive avec des signes de croissance.',
        factors: ['Indicateurs en hausse', 'Développement positif', 'Potentiel de croissance']
      };
    } else if (avgVolatility < 5 && Math.abs(avgGrowth) < 3) {
      return {
        status: 'Stable',
        color: 'blue' as StabilityColor,
        icon: Shield,
        description: 'Performance stable avec peu de variations significatives.',
        factors: ['Variations minimes', 'Résultats prévisibles', 'Risque faible']
      };
    } else if (avgVolatility > 20 || (revenue.growth * profit.growth < 0)) {
      return {
        status: 'Volatile',
        color: 'yellow' as StabilityColor,
        icon: Activity,
        description: 'Fluctuations importantes nécessitant une attention particulière.',
        factors: ['Variations importantes', 'Tendances contradictoires', 'Surveillance recommandée']
      };
    } else if (allNegative) {
      return {
        status: 'En Déclin',
        color: 'red' as StabilityColor,
        icon: TrendingDown,
        description: 'Tendance baissière sur l\'ensemble des indicateurs.',
        factors: ['Baisse généralisée', 'Révision stratégique nécessaire', 'Risque élevé']
      };
    } else {
      return {
        status: 'Performance Mixte',
        color: 'amber' as StabilityColor,
        icon: AlertTriangle,
        description: 'Résultats contrastés avec des opportunités d\'amélioration.',
        factors: ['Résultats divergents', 'Potentiel d\'optimisation', 'Analyse approfondie conseillée']
      };
    }
  };

  const renderMetricCard = (title: string, metric: SimpleMetric, isCurrency: boolean = true) => {
    const growthColor = metric.growth >= 0 ? 'text-green-600' : 'text-red-600';
    const progressPercent = Math.min(100, Math.max(0, ((metric.current / metric.previous) * 100) - 100 + 50));
    
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
        
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {isCurrency ? formatCurrency(metric.current) : `${metric.current.toFixed(1)}%`}
            </span>
            {metric.growth !== 0 && (
              <div className={`flex items-center ${growthColor}`}>
                {metric.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm ml-1 font-medium">{Math.abs(metric.growth).toFixed(1)}%</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600">
            Année précédente: {isCurrency ? formatCurrency(metric.previous) : `${metric.previous.toFixed(1)}%`}
          </p>
        </div>
        
        <div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${metric.growth >= 0 ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {metric.growth >= 0 ? 'Croissance' : 'Décroissance'} par rapport à l'année précédente
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Indicateurs Financiers Simplifiés</h2>
        <Euro className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderMetricCard('Chiffre d\'Affaires', metrics.revenue)}
        {renderMetricCard('Marge', metrics.margin, false)}
        {renderMetricCard('Bénéfices', metrics.profit)}
      </div>
      
      {/* Stability Indicator */}
      {(() => {
        const stability = calculateStability();
        const Icon = stability.icon;
        const colorClasses: Record<StabilityColor, string> = {
          green: 'bg-green-50 border-green-200 text-green-800',
          emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          blue: 'bg-blue-50 border-blue-200 text-blue-800',
          yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          amber: 'bg-amber-50 border-amber-200 text-amber-800',
          red: 'bg-red-50 border-red-200 text-red-800'
        };
        const iconColorClasses: Record<StabilityColor, string> = {
          green: 'text-green-600',
          emerald: 'text-emerald-600',
          blue: 'text-blue-600',
          yellow: 'text-yellow-600',
          amber: 'text-amber-600',
          red: 'text-red-600'
        };
        const progressColorClasses: Record<StabilityColor, string> = {
          green: 'bg-green-500',
          emerald: 'bg-emerald-500',
          blue: 'bg-blue-500',
          yellow: 'bg-yellow-500',
          amber: 'bg-amber-500',
          red: 'bg-red-500'
        };
        
        // Calculate stability score (0-100)
        const stabilityScore = (() => {
          switch (stability.status) {
            case 'Croissance Stable': return 90;
            case 'En Croissance': return 75;
            case 'Stable': return 85;
            case 'Performance Mixte': return 50;
            case 'Volatile': return 35;
            case 'En Déclin': return 20;
            default: return 50;
          }
        })();
        
        return (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className={`rounded-lg border-2 p-6 ${colorClasses[stability.color]}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <Icon className={`w-6 h-6 ${iconColorClasses[stability.color]} mr-3`} />
                  <div>
                    <h3 className="text-lg font-semibold">Indicateur de Stabilité</h3>
                    <p className="text-2xl font-bold mt-1">{stability.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Score de stabilité</p>
                  <p className="text-2xl font-bold">{stabilityScore}%</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColorClasses[stability.color]} transition-all duration-500`}
                    style={{ width: `${stabilityScore}%` }}
                  />
                </div>
              </div>
              
              <p className="text-sm mb-4">{stability.description}</p>
              
              <div>
                <p className="text-sm font-medium mb-2">Facteurs clés:</p>
                <ul className="space-y-1">
                  {stability.factors.map((factor, index) => (
                    <li key={index} className="text-sm flex items-start">
                      <span className="mr-2">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FinancialMetrics;