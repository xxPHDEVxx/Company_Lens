import React from 'react';

interface CompanyInfoFormProps {
  formData: {
    companyName: string;
    role: string;
    department: string;
    vatNumber: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

/**
 * Formulaire d'informations professionnelles
 * Gère les champs entreprise, rôle, département et numéro TVA
 */
const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ 
  formData, 
  errors, 
  onChange 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Informations Professionnelles
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom de l'entreprise */}
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'Entreprise
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom de votre entreprise"
            />
          </div>
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        {/* Rôle */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Fonction
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="text"
              id="role"
              value={formData.role}
              onChange={(e) => onChange('role', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Directeur Commercial"
            />
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Département */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Département
          </label>
          <select
            id="department"
            value={formData.department}
            onChange={(e) => onChange('department', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.department ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner un département</option>
            <option value="direction">Direction Générale</option>
            <option value="commercial">Commercial</option>
            <option value="marketing">Marketing</option>
            <option value="finance">Finance</option>
            <option value="rh">Ressources Humaines</option>
            <option value="it">Informatique</option>
            <option value="production">Production</option>
            <option value="logistique">Logistique</option>
            <option value="autre">Autre</option>
          </select>
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">{errors.department}</p>
          )}
        </div>

        {/* Numéro TVA */}
        <div>
          <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro TVA
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              type="text"
              id="vatNumber"
              value={formData.vatNumber}
              onChange={(e) => onChange('vatNumber', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.vatNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="BE0123456789"
            />
          </div>
          {errors.vatNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vatNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format: BE suivi de 10 chiffres
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoForm;