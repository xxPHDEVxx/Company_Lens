import { MapPin, Phone, Mail, Globe } from 'lucide-react';


interface ContactInfoProps {
  contact: {
    address: {
      street?: string;
      streetNumber?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      fullAddress?: string;
    };
    phone?: string;
    email?: string;
    website?: string;
  };
}

const ContactInfo = ({ contact }: ContactInfoProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Informations de Contact</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Addresses */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Adresse</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  {contact.address?.fullAddress ? (
                    <p className="text-sm text-gray-600">{contact.address.fullAddress}</p>
                  ) : (
                    <>
                      {(contact.address?.street || contact.address?.streetNumber) && (
                        <p className="text-sm text-gray-600">
                          {contact.address?.street} {contact.address?.streetNumber}
                        </p>
                      )}
                      {(contact.address?.postalCode || contact.address?.city) && (
                        <p className="text-sm text-gray-600">
                          {contact.address?.postalCode} {contact.address?.city}
                        </p>
                      )}
                      {contact.address?.country && (
                        <p className="text-sm text-gray-600">{contact.address.country}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Coordonnées</h3>
          <div className="space-y-3">
            {/* Phone */}
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">{contact.phone}</span>
            </div>
            
            {/* Email */}
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-3" />
              <a href={`mailto:${contact.email}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                {contact.email}
              </a>
            </div>
            
            {/* Website */}
            {contact.website && (
              <div className="flex items-center">
                <Globe className="w-4 h-4 text-gray-400 mr-3" />
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  {contact.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
