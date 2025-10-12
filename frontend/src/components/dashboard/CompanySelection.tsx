import { useState, useEffect, useRef } from 'react';
import { Building2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../../services/api';
import { config } from '../../config/environment';
import { authApi } from '../../services/api';

interface CompanySelectionProps {
  onCompanySelected?: () => void;
}

const CompanySelection = ({ onCompanySelected }: CompanySelectionProps) => {
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isScrapingPending, setIsScrapingPending] = useState(false);
  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);
  const MAX_POLLING_ATTEMPTS = 60; // 60 attempts * 3 seconds = 3 minutes max

  const associateCompanyMutation = useMutation({
    mutationFn: async (vat: string) => {
      // Use the new endpoint that handles both existing companies and scraping
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${config.API_BASE_URL}/api/users/profile/company/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ company_vat: vat })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de l\'association de l\'entreprise');
      }

      // Handle two cases:
      // 1. Company exists (200): data.status === 'success'
      // 2. Company doesn't exist, scraping launched (202): data.status === 'pending'
      return data;
    },
    onSuccess: async (data) => {
      if (data.status === 'pending') {
        // Company doesn't exist, scraping launched
        setError('');
        setSuccess(false);
        setIsScrapingPending(true);
        return;
      }

      // Company exists and was associated successfully
      setSuccess(true);
      setError('');
      setIsScrapingPending(false);

      // Invalidate all relevant queries to force refresh
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user'] }),
        queryClient.invalidateQueries({ queryKey: ['companies'] }),
        queryClient.invalidateQueries({ queryKey: ['auth'] }),
      ]);

      // Force refetch the user data immediately to update auth context
      await queryClient.refetchQueries({ queryKey: ['auth', 'user'] });

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

    // Belgian VAT format: BE0123456789 or 0123456789 (with optional spaces/dots)
    const cleanVat = vatNumber.replace(/[\s.]/g, '').toUpperCase();
    const vatRegex = /^(BE)?\d{10}$/;
    if (!vatRegex.test(cleanVat)) {
      setError('Format invalide. Le numéro de TVA belge doit être au format BE0123456789');
      return;
    }

    // Send the cleaned VAT (backend will normalize it)
    associateCompanyMutation.mutate(cleanVat);
  };

  // Polling effect: Check if user has been updated with company_id after scraping
  useEffect(() => {
    if (!isScrapingPending) return;

    const checkUserStatus = async () => {
      try {
        pollingAttemptsRef.current += 1;

        // Check if we've exceeded max attempts (3 minutes)
        if (pollingAttemptsRef.current > MAX_POLLING_ATTEMPTS) {
          setIsScrapingPending(false);
          setError('Le scraping a pris trop de temps. Veuillez rafraîchir la page ou réessayer plus tard.');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          return;
        }

        // Fetch fresh user data
        const userData = await authApi.getCurrentUser();

        // Check if user now has a company_id (not a VAT placeholder)
        if (userData.companyId && !userData.companyId.startsWith('BE')) {
          // User has been updated with actual company ID!
          setIsScrapingPending(false);
          setSuccess(true);
          setError('');

          // Clear polling interval
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Invalidate queries to refresh data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['user'] }),
            queryClient.invalidateQueries({ queryKey: ['companies'] }),
            queryClient.invalidateQueries({ queryKey: ['auth'] }),
          ]);

          // Refetch user data
          await queryClient.refetchQueries({ queryKey: ['auth', 'user'] });

          // Call callback after a short delay
          setTimeout(() => {
            if (onCompanySelected) {
              onCompanySelected();
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Error checking user status:', err);
        // Continue polling even on errors (might be temporary network issue)
      }
    };

    // Start polling every 3 seconds
    pollingAttemptsRef.current = 0;
    pollingIntervalRef.current = setInterval(checkUserStatus, 2000);

    // Cleanup on unmount or when scraping stops
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isScrapingPending, queryClient, onCompanySelected, MAX_POLLING_ATTEMPTS]);

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
              Format: BE suivi de 10 chiffres (ex: BE0123456789 ou 0123456789)
            </p>
          </div>

          {/* Scraping in progress state (similar to SearchResults) */}
          {isScrapingPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-sm text-blue-900 font-medium mb-2">
                Recherche en cours via notre IA...
              </p>
              <p className="text-xs text-blue-700 text-center max-w-md">
                Cette entreprise n'est pas encore dans notre base. Nous la recherchons pour vous. Cela peut prendre quelques minutes.
              </p>
            </div>
          )}

          {error && !isScrapingPending && (
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
            disabled={associateCompanyMutation.isPending || success || isScrapingPending}
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
            ) : isScrapingPending ? (
              'Scraping en cours...'
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