import { GlobeEuropeAfricaIcon } from '@heroicons/react/24/outline';

const EuropeanPresenceCard = () => (
  <div className="bg-white p-4 rounded-xl shadow-sm">
    <div className="flex items-center space-x-2 mb-4">
      <GlobeEuropeAfricaIcon className="h-5 w-5 text-blue-600" />
      <h4 className="font-medium text-gray-900">Présence Européenne</h4>
    </div>
    <div className="flex space-x-2">
      {['Belgique', 'France', 'Allemagne'].map((country) => (
        <div key={country} className="px-3 py-1 bg-blue-100 rounded-full">
          <span className="text-sm text-blue-700">{country}</span>
        </div>
      ))}
    </div>
  </div>
);

export default EuropeanPresenceCard; 