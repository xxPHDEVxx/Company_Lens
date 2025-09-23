import React from 'react';
import { Building, Calendar, Users, FileText, BarChart3, Factory, Info } from 'lucide-react';

interface GeneralInfoProps {
  info: {
    vat: string;
    legalForm: string;
    creationDate: string;
    capital: string;
    employees: number;
    naceCodes: string[];
    lastUpdate: string;
    companyType: string;
    companySize: string;
    companyDescription: string;
  };
}

/**
 * Component displaying general company information
 * Shows company details like VAT, legal form, size, type, etc.
 */
const GeneralInfo: React.FC<GeneralInfoProps> = ({ info }) => {
  /**
   * Maps company type codes to French labels
   * Supports both new API format (UPPERCASE) and legacy format
   */
  const getCompanyTypeLabel = (type: string): string => {
    if (!type || type === '-') return '-';
    
    const types: Record<string, string> = {
      // API format
      'PRIVATE': 'Société privée',
      'PUBLIC': 'Société publique',
      'NON_PROFIT': 'Sans but lucratif',
      'GOVERNMENT': 'Gouvernementale',
      'COOPERATIVE': 'Coopérative',
      'SOLE_PROPRIETORSHIP': 'Entreprise individuelle',
      'PARTNERSHIP': 'Partenariat',
    };
    return types[type] || type;
  };

  /**
   * Maps company size codes to French labels
   */
  const getCompanySizeLabel = (size: string): string => {
    if (!size || size === '-') return '-';
    
    const sizes: Record<string, string> = {
      'micro': 'Micro-entreprise',
      'small': 'Petite entreprise',
      'medium': 'Moyenne entreprise',
      'large': 'Grande entreprise'
    };
    return sizes[size] || size;
  };

  return (
    <div className="space-y-6">
      {/* Main Information Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations Générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <Building className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Numéro TVA</p>
                <p className="font-medium text-gray-900">{info.vat}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Forme juridique</p>
                <p className="font-medium text-gray-900">{info.legalForm || '-'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Date de création</p>
                <p className="font-medium text-gray-900">
                  {info.creationDate && info.creationDate !== '-' 
                    ? new Date(info.creationDate).toLocaleDateString('fr-BE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Nombre d'employés</p>
                <p className="font-medium text-gray-900">{info.employees}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <BarChart3 className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Type d'entreprise</p>
                <p className="font-medium text-gray-900">{getCompanyTypeLabel(info.companyType)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Factory className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Taille de l'entreprise</p>
                <p className="font-medium text-gray-900">{getCompanySizeLabel(info.companySize)}</p>
              </div>
            </div>
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Codes NACE</p>
                <p className="font-medium text-gray-900">{info.naceCodes.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Dernière mise à jour: {
              info.lastUpdate && info.lastUpdate !== '-' 
                ? (() => {
                    const date = new Date(info.lastUpdate);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                  })()
                : '-'
            }
          </p>
        </div>
      </div>

      {/* Company Description Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Description de l'entreprise</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">{info.companyDescription}</p>
      </div>
    </div>
  );
};

export default GeneralInfo;