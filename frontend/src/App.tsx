import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Recherche from './pages/Recherche';
import Groupes from './pages/Groupes';
import GroupDetails from './pages/GroupDetails';
import Suivi from './pages/Suivi';
import Historique from './pages/Historique';
import CompanyDetails from './pages/CompanyDetails';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                           location.pathname === '/recherche' || 
                           location.pathname === '/groupes' || 
                           location.pathname.startsWith('/groupes/') ||
                           location.pathname === '/suivi' ||
                           location.pathname === '/historique' ||
                           location.pathname.startsWith('/company/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Navbar only when NOT on dashboard routes */}
      {!isDashboardRoute && <Navbar />}
      <Routes>
        <Route path="/" element={
          <main className="container mx-auto px-4 py-8">
            <LandingPage />
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
        <Route path="/groupes/:groupId" element={<GroupDetails />} />
        <Route path="/suivi" element={<Suivi />} />
        <Route path="/historique" element={<Historique />} />
        <Route path="/company/:companyId" element={<CompanyDetails />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;