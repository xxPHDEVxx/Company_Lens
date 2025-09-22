import React from 'react';

interface PersonalInfoFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

/**
 * Formulaire d'informations personnelles
 * Gère les champs nom, prénom, email et téléphone
 */
const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  formData, 
  errors, 
  onChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Informations Personnelles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prénom */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Votre prénom"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Votre nom"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="votre.email@exemple.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+32 2 123 45 67"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;