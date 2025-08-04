import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

interface ContactInfoProps {
  contact: {
    Address: {
      street: string;
      streetNumber: string;
      city: string;
      postalCode: string;
      country: string;
    };
    phone?: string;
    email?: string;
    website?: string;
  };
}

const ContactInfo: React.FC<ContactInfoProps> = ({ contact }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de Contact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Addresses */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Adresse</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">{contact.Address.street} {contact.Address.streetNumber}</p>
                  <p className="text-sm text-gray-600">
                    {contact.Address.postalCode} {contact.Address.city}
                  </p>
                  <p className="text-sm text-gray-600">{contact.Address.country}</p>
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
