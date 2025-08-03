const DashboardSidebar = () => {
  return (
    <div className="h-screen sticky top-0 flex pl-8">
      <nav className="flex flex-col h-full py-24 w-full space-y-8">

        {/* Separator */}
                <div className="h-px bg-gray-200 w-full my-8"></div>

        {/* Recherche d'entreprise */}
        <a
          href="#"
          className="flex items-center text-base font-medium text-gray-600 hover:text-emerald-600 transition-colors duration-200 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center mr-4 group-hover:bg-emerald-50 transition-colors duration-200">
            <svg className="w-7 h-7 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span>Recherche</span>
        </a>

        {/* Groupes */}
        <a
          href="#"
          className="flex items-center text-base font-medium text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 flex items-center justify-center mr-4 group-hover:bg-purple-50 transition-colors duration-200">
            <svg className="w-7 h-7 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span>Groupes</span>
        </a>

        {/* Suivi */}
        <a
          href="#"
          className="flex items-center text-base font-medium text-gray-600 hover:text-orange-600 transition-colors duration-200 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 flex items-center justify-center mr-4 group-hover:bg-orange-50 transition-colors duration-200">
            <svg className="w-7 h-7 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span>Suivi</span>
        </a>

        {/* Historique */}
        <a
          href="#"
          className="flex items-center text-base font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-gray-500/30 flex items-center justify-center mr-4 group-hover:bg-gray-50 transition-colors duration-200">
            <svg className="w-7 h-7 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>Historique</span>
        </a>

        {/* Separator */}
        <div className="h-px bg-gray-200 w-full my-8"></div>

      </nav>
    </div>
  );
};

export default DashboardSidebar;