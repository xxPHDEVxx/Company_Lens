import { Building2, MapPin, Calendar, Shield } from 'lucide-react';

interface CompanyHeaderProps {
  company: {
    name: string;
    logo?: string;
    status: 'active' | 'inactive';
    vat: string;
    legalForm?: string;
    creationDate?: string;
    address?: {
      fullAddress?: string;
    };
    city?: string;
    region?: string;
  };
}

const CompanyHeader = ({ company }: CompanyHeaderProps) => {
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
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {company.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
            </div>
          )}
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{company.name}</h1>

              {/* Info badges - stack on mobile, inline on larger screens */}
              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">TVA: {company.vat}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    Créée le {
                      company.creationDate
                        ? new Date(company.creationDate).toLocaleDateString('fr-BE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{company.city || '-'}</span>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                {getStatusText(company.status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;