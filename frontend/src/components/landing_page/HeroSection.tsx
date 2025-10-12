import { useNavigate } from 'react-router-dom';
import { Icons } from '../../utils/icons';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
  <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-24 sm:py-32">
    {/* Background decorative elements */}
    <div className="absolute inset-0 -z-10">
      <svg
        className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
            width={200}
            height={200}
            x="50%"
            y={-1}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)" />
      </svg>
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-400 to-indigo-600 opacity-20"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>

    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 ring-1 ring-inset ring-blue-300">
            🇧🇪 Plateforme belge de données d'entreprises
          </span>
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          Analysez les entreprises{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            en un coup d'œil
          </span>
        </h1>
        
        <p className="mt-8 text-xl leading-8 text-gray-600 max-w-2xl mx-auto">
          Obtenez des informations détaillées sur n'importe quelle entreprise belge en utilisant simplement son numéro de TVA. 
          Données financières, légales et actualités en temps réel.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/signup')}
            className="group relative px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
            <span className="relative z-10">Commencer gratuitement</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
        
        <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center">
            <Icons.checkCircle className="h-5 w-5 text-green-500 mr-2" />
            Gratuit
          </div>
          <div className="flex items-center">
            <Icons.checkCircle className="h-5 w-5 text-green-500 mr-2" />
            Aucune carte requise
          </div>
          <div className="flex items-center">
            <Icons.checkCircle className="h-5 w-5 text-green-500 mr-2" />
            Support prochainement disponible
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default HeroSection; 