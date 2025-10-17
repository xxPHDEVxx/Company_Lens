import { useState } from 'react';
import { Icons } from '../../utils/icons';

const faqs = [
  {
    id: 1,
    question: 'Comment fonctionne Company Lens ?',
    answer: 'Company Lens collecte automatiquement des données depuis plusieurs sources officielles belges (Banque-Carrefour des Entreprises, Moniteur Belge, etc.) en utilisant simplement le numéro de TVA. Notre système traite ces informations et génère un rapport complet en quelques secondes.',
  },
  {
    id: 2,
    question: 'Quelles informations puis-je obtenir sur une entreprise ?',
    answer: 'Vous obtenez des informations complètes : données légales (statut, dirigeants, actionnaires), informations financières (chiffre d\'affaires, bilans, ratios), actualités récentes, historique de l\'entreprise, et bien plus encore.',
  },
  {
    id: 3,
    question: 'Les données sont-elles à jour ?',
    answer: 'Oui, nos données sont mises à jour chaque semaine depuis les sources officielles. Nous garantissons une mise à jour des informations pour vous assurer des analyses fiables.',
  },
  {
    id: 4,
    question: 'Company Lens est-il conforme au RGPD ?',
    answer: 'Oui, Company Lens est entièrement conforme au RGPD. Nous ne traitons que des données publiques d\'entreprises et respectons toutes les réglementations européennes en matière de protection des données.',
  },
  {
    id: 5,
    question: 'Puis-je intégrer Company Lens à mes outils existants ?',
    answer: 'Oui, nous proposerons une API complète qui vous permettra d\'intégrer nos données directement dans vos systèmes CRM, ERP ou autres outils métier.',
  },
];

const FAQSection = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">FAQ</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Questions fréquemment posées
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Trouvez rapidement les réponses aux questions les plus courantes sur Company Lens
            </p>
          </div>

          <div className="mt-16 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="group">
                <div className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200">
                  <button
                    className="flex w-full items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
                    onClick={() => toggleItem(faq.id)}
                  >
                    <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {faq.question}
                    </span>
                    <div className="ml-6 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200">
                      <Icons.plus
                        className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
                          openItems.includes(faq.id) ? 'rotate-45' : ''
                        }`}
                      />
                    </div>
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openItems.includes(faq.id) 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6">
                      <div className="h-px bg-gray-200 mb-4" />
                      <p className="text-base leading-7 text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;