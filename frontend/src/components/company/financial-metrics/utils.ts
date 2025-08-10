import { TrendingUp, TrendingDown, Shield, Activity, AlertTriangle } from 'lucide-react';
import type { FinancialMetricsData, StabilityIndicator, StabilityColor } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export const calculateStability = (metrics: FinancialMetricsData): StabilityIndicator => {
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
      description: 'Tendance négative sur l\'ensemble des indicateurs.',
      factors: ['Baisse généralisée', 'Révision stratégique nécessaire', 'Action corrective urgente']
    };
  } else {
    return {
      status: 'Mixte',
      color: 'amber' as StabilityColor,
      icon: AlertTriangle,
      description: 'Performance variable avec des résultats contrastés.',
      factors: ['Résultats divergents', 'Analyse approfondie recommandée', 'Optimisation nécessaire']
    };
  }
};

export const getStabilityBgColor = (color: StabilityColor): string => {
  const colorMap: Record<StabilityColor, string> = {
    green: 'bg-green-50',
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50'
  };
  return colorMap[color];
};

export const getStabilityTextColor = (color: StabilityColor): string => {
  const colorMap: Record<StabilityColor, string> = {
    green: 'text-green-700',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    yellow: 'text-yellow-700',
    amber: 'text-amber-700',
    red: 'text-red-700'
  };
  return colorMap[color];
};

export const getStabilityBorderColor = (color: StabilityColor): string => {
  const colorMap: Record<StabilityColor, string> = {
    green: 'border-green-200',
    emerald: 'border-emerald-200',
    blue: 'border-blue-200',
    yellow: 'border-yellow-200',
    amber: 'border-amber-200',
    red: 'border-red-200'
  };
  return colorMap[color];
};