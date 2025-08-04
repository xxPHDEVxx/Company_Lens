import React from 'react';
import { Building2, MapPin, Calendar, Shield } from 'lucide-react';

interface CompanyHeaderProps {
  company: {
    name: string;
    logo?: string;
    status: 'active' | 'inactive';
    vat: string;
    legalForm: string;
    creationDate: string;
    mainAddress: string;
  };
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({ company }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-10 h-10 text-indigo-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                <span>TVA: {company.vat}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Créée le {company.creationDate}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{company.mainAddress}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Forme juridique: </span>
              <span className="text-sm font-medium text-gray-900">{company.legalForm}</span>
            </div>
          </div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
            {getStatusText(company.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;