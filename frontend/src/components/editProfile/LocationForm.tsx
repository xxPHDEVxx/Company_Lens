import React from 'react';

interface LocationFormProps {
  formData: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    region: string;
    country: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

/**
 * Formulaire d'adresse et localisation
 * Gère les champs d'adresse complète avec validation belge
 */
const LocationForm: React.FC<LocationFormProps> = ({ 
  formData, 
  errors, 
  onChange 
}) => {
  // Régions belges
  const belgianRegions = [
    { value: 'bruxelles', label: 'Région de Bruxelles-Capitale' },
    { value: 'flandre', label: 'Région flamande' },
    { value: 'wallonie', label: 'Région wallonne' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Adresse et Localisation
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rue */}
        <div className="md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
            Rue
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                id="street"
                value={formData.street}
                onChange={(e) => onChange('street', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom de la rue"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600">{errors.street}</p>
              )}
            </div>
            <div className="w-32">
              <input
                type="text"
                id="number"
                value={formData.number}
                onChange={(e) => onChange('number', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="N°"
              />
              {errors.number && (
                <p className="mt-1 text-sm text-red-600">{errors.number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Code Postal */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
            Code Postal
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              maxLength={4}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1000"
            />
          </div>
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
          )}
        </div>

        {/* Ville */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Ville
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => onChange('city', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Bruxelles"
            />
          </div>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* Région */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Région
          </label>
          <select
            id="region"
            value={formData.region}
            onChange={(e) => onChange('region', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.region ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner une région</option>
            {belgianRegions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="mt-1 text-sm text-red-600">{errors.region}</p>
          )}
        </div>

        {/* Pays */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Pays
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => onChange('country', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Belgique"
            />
          </div>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>
      </div>

      {/* Note informative */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Ces informations sont utilisées pour personnaliser votre expérience et vous proposer des entreprises pertinentes dans votre région.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;