import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Navbar only when NOT on dashboard */}
      {!isDashboard && <Navbar />}
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