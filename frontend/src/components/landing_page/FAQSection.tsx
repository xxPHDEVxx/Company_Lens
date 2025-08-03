import { useState } from 'react';

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
    answer: 'Oui, nos données sont mises à jour quotidiennement depuis les sources officielles. Nous garantissons une fraîcheur maximale des informations pour vous assurer des analyses fiables.',
  },
  {
    id: 4,
    question: 'Y a-t-il une période d\'essai gratuite ?',
    answer: 'Absolument ! Nous offrons une période d\'essai gratuite de 14 jours sans engagement. Aucune carte bancaire n\'est requise pour commencer, et vous pouvez annuler à tout moment.',
  },
  {
    id: 5,
    question: 'Company Lens est-il conforme au RGPD ?',
    answer: 'Oui, Company Lens est entièrement conforme au RGPD. Nous ne traitons que des données publiques d\'entreprises et respectons toutes les réglementations européennes en matière de protection des données.',
  },
  {
    id: 6,
    question: 'Puis-je intégrer Company Lens à mes outils existants ?',
    answer: 'Oui, nous proposons une API complète qui vous permet d\'intégrer nos données directement dans vos systèmes CRM, ERP ou autres outils métier. Notre équipe technique peut vous accompagner dans l\'intégration.',
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
                      <svg
                        className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
                          openItems.includes(faq.id) ? 'rotate-45' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
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

          {/* Contact section */}
          <div className="mt-16 text-center">
            <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Vous avez d'autres questions ?
              </h3>
              <p className="text-gray-600 mb-6">
                Notre équipe d'experts est là pour vous aider. Contactez-nous et obtenez une réponse personnalisée.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Nous contacter
                </button>
                
                <button className="inline-flex items-center px-6 py-3 text-base font-medium text-blue-600 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat en direct
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;