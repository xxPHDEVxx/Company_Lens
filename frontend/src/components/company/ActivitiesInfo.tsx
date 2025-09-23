import { Briefcase, Hash, Building2, Wrench } from 'lucide-react';
import type { Activity } from '../../types/api';

interface ActivitiesInfoProps {
  activities?: Activity;
}

const ActivitiesInfo = ({ activities }: ActivitiesInfoProps) => {
  if (!activities) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Activités</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune information sur les activités disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* NACEBEL Codes */}
      {activities.nacebelCodes && activities.nacebelCodes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Hash className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Codes NACEBEL</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {activities.nacebelCodes.map((code, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm ${
                  index === 0 
                    ? 'bg-indigo-100 text-indigo-800 font-medium' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {code}
                {index === 0 && <span className="ml-2 text-xs">(Principal)</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sectors */}
      {activities.sectors && activities.sectors.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Building2 className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Secteurs d'activité</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activities.sectors.map((sector, index) => (
              <div 
                key={index}
                className={`flex items-start p-3 rounded-lg ${
                  index === 0 ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3" />
                <div>
                  <p className={`${index === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {sector}
                  </p>
                  {index === 0 && <span className="text-xs text-indigo-600">Secteur principal</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Activities */}
      {activities.companyActivities && activities.companyActivities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Briefcase className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Activités de l'entreprise</h2>
          </div>
          <div className="space-y-3">
            {activities.companyActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3" />
                <p className="text-gray-700">{activity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {activities.services && activities.services.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Wrench className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">Services proposés</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.services.map((service, index) => (
              <div 
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-1.5 h-1.5 bg-gray-400 rounded-full mr-3" />
                <p className="text-gray-700">{service}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {activities.description && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Description des activités</h2>
          <p className="text-gray-700 leading-relaxed">{activities.description}</p>
        </div>
      )}

      {/* Empty state if no data available */}
      {(!activities.nacebelCodes || activities.nacebelCodes.length === 0) &&
       (!activities.sectors || activities.sectors.length === 0) &&
       (!activities.companyActivities || activities.companyActivities.length === 0) &&
       (!activities.services || activities.services.length === 0) &&
       !activities.description && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Activités</h2>
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune information détaillée sur les activités disponible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesInfo;