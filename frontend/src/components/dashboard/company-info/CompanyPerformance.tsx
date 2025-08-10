interface FinancialData {
  year: number;
  revenue: number;
  profit: number;
}

interface FinancialMetrics {
  revenue: {
    growth?: number;
  };
}

interface CompanyPerformanceProps {
  latestFinancialData?: FinancialData;
  previousFinancialData?: FinancialData;
  financialMetrics?: FinancialMetrics;
}

const CompanyPerformance: React.FC<CompanyPerformanceProps> = ({
  latestFinancialData,
  previousFinancialData,
  financialMetrics
}) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Performance & Évolution</h4>
      
      {/* Growth Indicators */}
      <GrowthIndicators financialMetrics={financialMetrics} />
      
      {/* Year Comparison */}
      <YearComparison 
        latestFinancialData={latestFinancialData}
        previousFinancialData={previousFinancialData}
      />
    </div>
  );
};

const GrowthIndicators: React.FC<{ financialMetrics?: FinancialMetrics }> = ({ financialMetrics }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <div className="flex items-center space-x-2 mb-4">
      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
      <h5 className="font-medium text-gray-900">Indicateurs de croissance</h5>
    </div>
    <div className="space-y-3">
      <ProgressBar 
        label="Croissance annuelle"
        value={financialMetrics?.revenue.growth || 0}
        displayValue={financialMetrics?.revenue.growth ? `${financialMetrics.revenue.growth.toFixed(1)}%` : '0%'}
        color="from-blue-500 to-blue-600"
      />
      <ProgressBar 
        label="Stabilité financière"
        value={92}
        displayValue="92%"
        color="from-green-500 to-green-600"
      />
    </div>
  </div>
);

const ProgressBar: React.FC<{
  label: string;
  value: number;
  displayValue: string;
  color: string;
}> = ({ label, value, displayValue, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{displayValue}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`bg-gradient-to-r ${color} h-2 rounded-full`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

const YearComparison: React.FC<{
  latestFinancialData?: FinancialData;
  previousFinancialData?: FinancialData;
}> = ({ latestFinancialData, previousFinancialData }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <h5 className="font-medium text-gray-900 mb-3">Comparaison annuelle</h5>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">
          {latestFinancialData?.year || new Date().getFullYear()}
        </p>
        <p className="text-xl font-bold text-blue-600">
          €{latestFinancialData ? (latestFinancialData.revenue / 1000000).toFixed(2) : '0'}M
        </p>
      </div>
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-1">
          {previousFinancialData?.year || new Date().getFullYear() - 1}
        </p>
        <p className="text-xl font-bold text-gray-600">
          €{previousFinancialData ? (previousFinancialData.revenue / 1000000).toFixed(2) : '0'}M
        </p>
      </div>
    </div>
  </div>
);

export default CompanyPerformance;