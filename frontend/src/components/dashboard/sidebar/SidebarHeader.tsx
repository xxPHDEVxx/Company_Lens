import { Link } from 'react-router-dom';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <div className="relative border-b border-slate-700/50 h-20">
      {/* Expand button when collapsed - absolute positioned */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-6 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
          title="Agrandir la barre latérale"
        >
          <svg 
            className="w-3 h-3 text-slate-400 hover:text-white transition-colors duration-300 rotate-180"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div className="h-full flex items-center">
        {isCollapsed ? (
          /* Collapsed: */
          <div className="w-full grid items-center h-full">
            <div className="flex justify-center">
              <Link to="/dashboard" className="flex items-center group">
                <CompanyLogo />
              </Link>
            </div>
          </div>
        ) : (
          /* Expanded: Regular flex layout */
          <div className="w-full flex items-center justify-between px-4 h-full">
            <Link to="/dashboard" className="flex items-center group">
              <CompanyLogo />
              <span className="ml-3 text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                CompanyLens
              </span>
            </Link>
            <button
              onClick={onToggleCollapse}
              className="w-6 h-6 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="Réduire la barre latérale"
            >
              <svg 
                className="w-3 h-3 text-slate-400 hover:text-white transition-all duration-300"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Extract Logo component for reusability
const CompanyLogo: React.FC = () => (
  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M12 6.5c-.83 0-1.5.67-1.5 1.5h-2c0-1.93 1.57-3.5 3.5-3.5v2z"/>
      <path d="M8 12c0 .83.67 1.5 1.5 1.5v2c-1.93 0-3.5-1.57-3.5-3.5h2z"/>
      <path d="M12 17.5c.83 0 1.5-.67 1.5-1.5h2c0 1.93-1.57 3.5-3.5 3.5v-2z"/>
      <path d="M16 12c0-.83-.67-1.5-1.5-1.5v-2c1.93 0 3.5 1.57 3.5 3.5h-2z"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  </div>
);

export default SidebarHeader;