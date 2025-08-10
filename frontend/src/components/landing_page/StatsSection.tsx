import { Icons } from '../../utils/icons';

const stats = [
  {
    id: 1,
    name: 'Entreprises analysées',
    value: '250K+',
    description: 'Entreprises belges dans notre base de données',
    icon: <Icons.building className="h-6 w-6" />,
  },
  {
    id: 2,
    name: 'Rapports générés',
    value: '500K+',
    description: 'Rapports détaillés créés pour nos utilisateurs',
    icon: <Icons.document className="h-6 w-6" />,
  },
  {
    id: 3,
    name: 'Utilisateurs actifs',
    value: '15K+',
    description: 'Professionnels qui nous font confiance',
    icon: <Icons.users className="h-6 w-6" />,
  },
  {
    id: 4,
    name: 'Précision des données',
    value: '99.9%',
    description: 'Fiabilité de nos informations',
    icon: <Icons.checkCircleOutline className="h-6 w-6" />,
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
                <Icons.shield className="h-8 w-8 text-green-600" />
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
                <Icons.lightning className="h-8 w-8 text-blue-600" />
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
                <Icons.support className="h-8 w-8 text-purple-600" />
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