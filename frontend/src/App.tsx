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
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { LogoutProvider } from './contexts/LogoutContext';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = [
    '/dashboard',
    '/recherche',
    '/groupes',
    '/suivi',
    '/historique'
  ].some(route => location.pathname.startsWith(route)) ||
  location.pathname.startsWith('/company/');

  return (
    <div className="min-h-screen bg-gray-50">
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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/recherche" element={
          <ProtectedRoute>
            <Recherche />
          </ProtectedRoute>
        } />
        <Route path="/groupes" element={
          <ProtectedRoute>
            <Groupes />
          </ProtectedRoute>
        } />
        <Route path="/groupes/:groupId" element={
          <ProtectedRoute>
            <GroupDetails />
          </ProtectedRoute>
        } />
        <Route path="/suivi" element={
          <ProtectedRoute>
            <Suivi />
          </ProtectedRoute>
        } />
        <Route path="/historique" element={
          <ProtectedRoute>
            <Historique />
          </ProtectedRoute>
        } />
        <Route path="/company/:companyId" element={
          <ProtectedRoute>
            <CompanyDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <LogoutProvider>
          <AppContent />
        </LogoutProvider>
      </SidebarProvider>
    </Router>
  );
}

export default App;