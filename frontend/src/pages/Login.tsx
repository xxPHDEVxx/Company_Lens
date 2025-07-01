
const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Connexion</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input type="password" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700">Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default Login; 