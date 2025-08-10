import type { ReactNode } from 'react';

export interface NavigationItemData {
  id: string;
  label: string;
  route: string;
  icon: ReactNode;
  activeColor: string;
  iconHoverColor: string;
  indicatorColor: string;
}

interface NavigationItemProps {
  item: NavigationItemData;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (route: string) => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  isActive,
  isCollapsed,
  onClick,
}) => {
  return (
    <div className="relative group mb-2">
      <button
        onClick={() => onClick(item.route)}
        className={`w-full flex items-center rounded-xl transition-all duration-300 relative ${
          isCollapsed ? 'py-3 justify-center' : 'px-4 py-3'
        } ${
          isActive
            ? item.activeColor.split(' ')[0] + ' shadow-lg'
            : 'hover:bg-slate-700/50'
        }`}
        title={isCollapsed ? item.label : ''}
      >
        {/* Icon Container - Always in fixed position */}
        <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
          <span
            className={`transition-colors duration-300 ${
              isActive
                ? item.activeColor.includes('text-') ? item.activeColor.split(' ')[1] : ''
                : `text-slate-400 ${item.iconHoverColor}`
            }`}
          >
            {item.icon}
          </span>
        </div>
        
        {/* Text Container - Smooth transition */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-0 ml-0 opacity-0' : 'w-auto ml-3 opacity-100'
        }`}>
          <span className={`font-medium text-sm whitespace-nowrap ${
            isActive ? 'text-white' : 'text-slate-300'
          }`}>
            {item.label}
          </span>
        </div>
        
        {/* Active indicator bar */}
        {isActive && (
          <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 ${item.indicatorColor} rounded-r-full transition-all duration-300`} />
        )}
      </button>
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-2xl border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-slate-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default NavigationItem;