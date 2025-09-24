import { useState } from 'react';
import { Building2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../../services/api';
import { config } from '../../config/environment';

interface CompanySelectionProps {
  onCompanySelected?: () => void;
}

const CompanySelection = ({ onCompanySelected }: CompanySelectionProps) => {
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const associateCompanyMutation = useMutation({
    mutationFn: async (vat: string) => {
      // First, verify the company exists using the search API
      const companies = await companyApi.search({ vatNumber: vat });
      if (!companies || companies.length === 0) {
        throw new Error('Aucune entreprise trouvée avec ce numéro de TVA');
      }
      
      const company = companies[0];
      
      // Associate the company with the user using fetch directly
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/auth/user/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ companyId: company.id })
      });
      
      if (!response.ok) {
        throw new Error('Failed to associate company');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSuccess(true);
      setError('');
      // Update user data in cache and invalidate all user queries
      queryClient.setQueryData(['user', 'current'], data);
      
      // Invalidate all relevant queries to force refresh
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Force refetch the company data if the user has a company
      if (data.companyId) {
        queryClient.invalidateQueries({ queryKey: ['companies', 'detail', data.companyId] });
      }
      
      // Call callback after a short delay to show success message
      setTimeout(() => {
        if (onCompanySelected) {
          onCompanySelected();
        }
      }, 1500);
    },
    onError: (error: any) => {
      setError(error.message || 'Une erreur est survenue lors de l\'association de l\'entreprise');
      setSuccess(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate VAT number format
    if (!vatNumber.trim()) {
      setError('Veuillez entrer un numéro de TVA');
      return;
    }
    
    // Belgian VAT format: BE + 10 digits
    const vatRegex = /^BE\d{10}$/;
    if (!vatRegex.test(vatNumber.replace(/\s/g, '').toUpperCase())) {
      setError('Format invalide. Le numéro de TVA belge doit être au format BE0123456789');
      return;
    }
    
    const formattedVat = vatNumber.replace(/\s/g, '').toUpperCase();
    associateCompanyMutation.mutate(formattedVat);
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Associez votre entreprise
          </h2>
          <p className="text-gray-600">
            Pour accéder à toutes les fonctionnalités, veuillez associer votre compte à votre entreprise
            en entrant son numéro de TVA.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="vat" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de TVA
            </label>
            <div className="relative">
              <input
                type="text"
                id="vat"
                value={vatNumber}
                onChange={(e) => {
                  setVatNumber(e.target.value);
                  setError('');
                  setSuccess(false);
                }}
                placeholder="BE0123456789"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={associateCompanyMutation.isPending}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Format: BE suivi de 10 chiffres (ex: BE0123456789)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Entreprise associée avec succès ! Redirection en cours...
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={associateCompanyMutation.isPending || success}
            className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {associateCompanyMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche en cours...
              </span>
            ) : success ? (
              'Redirection...'
            ) : (
              'Associer mon entreprise'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Pourquoi cette étape ?</strong><br />
            L'association à votre entreprise vous permet d'accéder à :
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Tableau de bord personnalisé avec les données de votre entreprise
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Suivi de vos concurrents et partenaires
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Analyses et rapports détaillés
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanySelection;