import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Recherche from './pages/Recherche';
import Groupes from './pages/Groupes';
import Suivi from './pages/Suivi';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                           location.pathname === '/recherche' || 
                           location.pathname === '/groupes' || 
                           location.pathname === '/suivi';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Navbar only when NOT on dashboard routes */}
      {!isDashboardRoute && <Navbar />}
      <Routes>
        <Route path="/" element={
          <main className="container mx-auto px-4 py-8">
            <Home />
          </main>
        } />
        <Route path="/login" element={
          <main className="container mx-auto px-4 py-8">
            <Login />
          </main>
        } />
        <Route path="/signup" element={
          <main className="container mx-auto px-4 py-8">
            <Signup />
          </main>
        } />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/groupes" element={<Groupes />} />
        <Route path="/suivi" element={<Suivi />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;