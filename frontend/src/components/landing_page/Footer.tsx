import { Link } from 'react-router-dom';
import { Icons } from '../../utils/icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navigation = {
    product: [
      { name: 'Fonctionnalités', href: '#features' },
      { name: 'Tarifs', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'Documentation', href: '#docs' },
    ],
    company: [
      { name: 'À propos', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Carrières', href: '#careers' },
      { name: 'Presse', href: '#press' },
    ],
    support: [
      { name: 'Centre d\'aide', href: '#help' },
      { name: 'Contact', href: '#contact' },
      { name: 'Statut du service', href: '#status' },
      { name: 'Communauté', href: '#community' },
    ],
    legal: [
      { name: 'Confidentialité', href: '#privacy' },
      { name: 'Conditions d\'utilisation', href: '#terms' },
      { name: 'Cookies', href: '#cookies' },
      { name: 'RGPD', href: '#gdpr' },
    ],
  };

  const socialMedia = [
    {
      name: 'LinkedIn',
      href: '#',
      icon: <Icons.linkedin className="h-6 w-6" />,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: <Icons.twitter className="h-6 w-6" />,
    },
    {
      name: 'Facebook',
      href: '#',
      icon: <Icons.facebook className="h-6 w-6" />,
    },
    {
      name: 'GitHub',
      href: '#',
      icon: <Icons.github className="h-6 w-6" />,
    },
  ];

  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        {/* Main footer content */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Company info */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Company Lens
              </span>
            </Link>
            <p className="text-sm leading-6 text-gray-300">
              La plateforme de référence pour l'analyse des entreprises belges. 
              Obtenez des informations fiables et à jour sur plus de 250 000 entreprises.
            </p>
            <div className="flex space-x-6">
              {socialMedia.map((item) => (
                <a key={item.name} href={item.href} className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Produit</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Entreprise</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Légal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter subscription */}
        <div className="mt-16 border-t border-gray-800 pt-8 sm:mt-20 lg:mt-24">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="xl:col-span-1">
              <h3 className="text-sm font-semibold leading-6 text-white">
                Restez informé
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Recevez les dernières actualités et mises à jour de Company Lens.
              </p>
            </div>
            <div className="mt-6 xl:col-span-2 xl:mt-0">
              <form className="sm:flex sm:max-w-md lg:max-w-lg">
                <label htmlFor="email-address" className="sr-only">
                  Adresse email
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 appearance-none rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-base text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Entrez votre email"
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
                  >
                    S'abonner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-gray-800 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <span className="inline-flex items-center text-sm text-gray-400">
              🇧🇪 Fait en Belgique avec ❤️
            </span>
          </div>
          <p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0">
            &copy; {currentYear} Company Lens. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;