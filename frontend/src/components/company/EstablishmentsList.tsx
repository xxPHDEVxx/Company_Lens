import React from 'react';
import { MapPin, Calendar} from 'lucide-react';

interface Establishment {
  id: string;
  unitNumber: string;
  name: string;
  address: {
    street: string;
    streetNumber: string;
    city: string;
    postalCode: string;
    country: string;
  };
  creationDate: string;
  status: 'active' | 'inactive';
}

interface EstablishmentsListProps {
  establishments: Establishment[];
}

const EstablishmentsList: React.FC<EstablishmentsListProps> = ({ establishments }) => {

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Unités d'établissement ({establishments.length})
      </h2>
      {establishments.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune unité d'établissement enregistrée</p>
        </div>
      ) : (
      <div className="space-y-4">
        {establishments.map((establishment) => (
          <div
            key={establishment.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{establishment.name || 'Établissement'}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Unité n° {establishment.unitNumber || '-'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  establishment.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {establishment.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    {establishment.address ? (
                      <>
                        <p className="text-gray-900">
                          {establishment.address.street} {establishment.address.streetNumber}
                        </p>
                        <p className="text-gray-600">
                          {establishment.address.postalCode} {establishment.address.city}
                        </p>
                        <p className="text-gray-600">{establishment.address.country}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">Adresse non disponible</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {establishment.creationDate ? `Créé le ${establishment.creationDate}` : 'Date de création inconnue'}
                  </span>
                </div>
                
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default EstablishmentsList;