const stats = [
  {
    id: 1,
    name: 'Entreprises analysées',
    value: '250K+',
    description: 'Entreprises belges dans notre base de données',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 2,
    name: 'Rapports générés',
    value: '500K+',
    description: 'Rapports détaillés créés pour nos utilisateurs',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    name: 'Utilisateurs actifs',
    value: '15K+',
    description: 'Professionnels qui nous font confiance',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    id: 4,
    name: 'Précision des données',
    value: '99.9%',
    description: 'Fiabilité de nos informations',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const trustedBy = [
  { name: 'BNP Paribas Fortis', logo: '🏦' },
  { name: 'KBC Bank', logo: '🏛️' },
  { name: 'Belfius', logo: '🏢' },
  { name: 'ING Belgium', logo: '🦁' },
  { name: 'Deloitte Belgium', logo: '📊' },
  { name: 'PwC Belgium', logo: '⚖️' },
];

const StatsSection = () => (
  <div className="bg-white py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      {/* Trust indicators */}
      <div className="mx-auto max-w-2xl text-center mb-20">
        <h2 className="text-base font-semibold leading-7 text-gray-600 uppercase tracking-wide">
          Ils nous font confiance
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {trustedBy.map((company) => (
            <div key={company.name} className="flex items-center space-x-3 text-gray-500 hover:text-blue-600 transition-colors duration-200">
              <span className="text-2xl">{company.logo}</span>
              <span className="font-medium text-sm">{company.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Des chiffres qui parlent d'eux-mêmes
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez pourquoi Company Lens est la référence en Belgique pour l'analyse d'entreprises
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="group relative">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl hover:ring-blue-300 transition-all duration-300">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  {/* Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  
                  {/* Value */}
                  <dt className="mt-6 text-4xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {stat.value}
                  </dt>
                  
                  {/* Name */}
                  <dd className="mt-2 text-lg font-semibold text-gray-700">
                    {stat.name}
                  </dd>
                  
                  {/* Description */}
                  <dd className="mt-1 text-sm text-gray-500">
                    {stat.description}
                  </dd>
                </div>

                {/* Decorative element */}
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </dl>

        {/* Additional trust elements */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Conformité RGPD</h3>
            <p className="mt-2 text-sm text-gray-600">
              Toutes vos données sont protégées selon les normes européennes les plus strictes
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Mise à jour en temps réel</h3>
            <p className="mt-2 text-sm text-gray-600">
              Nos données sont actualisées quotidiennement depuis les sources officielles
            </p>
          </div>

          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Support expert</h3>
            <p className="mt-2 text-sm text-gray-600">
              Notre équipe d'experts est disponible 24/7 pour vous accompagner
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StatsSection;