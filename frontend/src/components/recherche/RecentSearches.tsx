const RecentSearches = () => {
  const recentSearches = [
    { name: 'Delhaize Group', vat: 'BE 0402.206.045', time: 'Il y a 2 heures', color: 'from-blue-500 to-blue-600' },
    { name: 'Proximus', vat: 'BE 0202.239.951', time: 'Il y a 5 heures', color: 'from-emerald-500 to-emerald-600' },
    { name: 'KBC Bank', vat: 'BE 0462.920.226', time: 'Il y a 1 jour', color: 'from-purple-500 to-purple-600' },
    { name: 'Solvay', vat: 'BE 0403.091.220', time: 'Il y a 2 jours', color: 'from-orange-500 to-orange-600' },
    { name: 'AB InBev', vat: 'BE 0417.497.106', time: 'Il y a 3 jours', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recherches récentes</h2>
        <p className="text-sm text-gray-600 mt-1">Vos dernières analyses d'entreprises</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {recentSearches.map((search, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className={`w-10 h-10 bg-gradient-to-r ${search.color} rounded-lg flex items-center justify-center mr-4`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{search.name}</h3>
                  <p className="text-sm text-gray-600">{search.vat}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">{search.time}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Voir tout l'historique →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentSearches;