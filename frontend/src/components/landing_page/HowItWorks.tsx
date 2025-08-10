import { Icons } from '../../utils/icons';

const steps = [
  {
    id: 1,
    title: 'Saisissez le numéro de TVA',
    description: 'Entrez simplement le numéro de TVA belge de l\'entreprise que vous souhaitez analyser.',
    icon: <Icons.document className="h-8 w-8" />,
  },
  {
    id: 2,
    title: 'Analyse automatique',
    description: 'Notre système collecte et traite automatiquement les données depuis plusieurs sources officielles belges.',
    icon: <Icons.lightbulb className="h-8 w-8" />,
  },
  {
    id: 3,
    title: 'Rapport complet',
    description: 'Recevez un rapport détaillé avec toutes les informations financières, légales et les actualités récentes.',
    icon: <Icons.chartBar className="h-8 w-8" />,
  },
];

const HowItWorks = () => (
  <div className="py-24 sm:py-32 bg-gray-50">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-base font-semibold leading-7 text-blue-600">Comment ça marche</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Trois étapes simples pour analyser une entreprise
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Notre processus est conçu pour être rapide, précis et facile à utiliser. En quelques secondes, 
          obtenez toutes les informations dont vous avez besoin.
        </p>
      </div>
      
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {steps.map((step, stepIdx) => (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {stepIdx < steps.length - 1 && (
                <div className="absolute top-12 left-1/2 hidden lg:block w-full h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 transform translate-x-4" />
              )}
              
              <div className="group relative">
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Step number and icon */}
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600 shadow-md border-2 border-blue-100">
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold leading-7 text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect background */}
                <div className="absolute inset-0 -m-4 rounded-2xl bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA section */}
        <div className="mt-16 text-center">
          <button className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Essayez maintenant gratuitement
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default HowItWorks;