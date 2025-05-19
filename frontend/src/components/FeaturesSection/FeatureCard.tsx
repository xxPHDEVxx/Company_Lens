import { ReactComponentType } from 'react';

interface FeatureCardProps {
  name: string;
  description: string;
  icon: ReactComponentType<React.SVGProps<SVGSVGElement>>;
}

const FeatureCard = ({ name, description, icon: Icon }: FeatureCardProps) => (
  <div className="flex flex-col">
    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
      <Icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
      {name}
    </dt>
    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
      <p className="flex-auto">{description}</p>
    </dd>
  </div>
);

export default FeatureCard; 