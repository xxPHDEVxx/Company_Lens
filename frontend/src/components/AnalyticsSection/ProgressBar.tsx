interface ProgressBarProps {
  label: string;
  value: number;
  color: 'green' | 'blue';
}

const ProgressBar = ({ label, value, color }: ProgressBarProps) => {
  const textColorClass = color === 'green' ? 'text-green-600' : 'text-blue-600';
  const bgColorClass = color === 'green' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={textColorClass}>{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${bgColorClass} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar; 