import type { LucideIcon } from 'lucide-react';

export interface SimpleMetric {
  current: number;
  previous: number;
  growth: number;
}

export interface FinancialMetricsData {
  revenue: SimpleMetric;
  margin: SimpleMetric;
  profit: SimpleMetric;
}

export type StabilityColor = 'green' | 'emerald' | 'blue' | 'yellow' | 'amber' | 'red';

export interface StabilityIndicator {
  status: string;
  color: StabilityColor;
  icon: LucideIcon;
  description: string;
  factors: string[];
}

export interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  current: number;
  previous: number;
  growth: number;
  format: 'currency' | 'percentage';
}