import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CL</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Company Lens
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <button className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300">
                Connexion
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Inscription
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 