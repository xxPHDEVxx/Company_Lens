import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <span className="text-xl font-bold text-gray-800">
                Company Lens
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Connexion
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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