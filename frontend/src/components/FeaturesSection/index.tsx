import { BuildingOfficeIcon, DocumentTextIcon, NewspaperIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import FeatureCard from './FeatureCard';

const features = [
  {
    name: 'Informations Légales',
    description: 'Accédez aux données légales complètes des entreprises',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Données Financières',
    description: 'Analysez les performances financières et les bilans',
    icon: ChartBarIcon,
  },
  {
    name: 'Actualités',
    description: 'Restez informé des dernières nouvelles concernant l\'entreprise',
    icon: NewspaperIcon,
  },
  {
    name: 'Documents',
    description: 'Consultez les documents officiels et rapports',
    icon: DocumentTextIcon,
  },
];

const FeaturesSection = () => (
  <div className="py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-blue-600">Fonctionnalités</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Tout ce dont vous avez besoin pour analyser une entreprise
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.name} {...feature} />
          ))}
        </dl>
      </div>
    </div>
  </div>
);

export default FeaturesSection; 