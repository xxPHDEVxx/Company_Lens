import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

interface LogoutContextType {
  showLogoutModal: () => void;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export const useLogout = () => {
  const context = useContext(LogoutContext);
  if (!context) {
    throw new Error('useLogout must be used within a LogoutProvider');
  }
  return context;
};

export const LogoutProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const showLogoutModal = () => {
    setIsModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await authApi.logout();
      navigate('/login');
    } catch (error) {
      // Even if logout fails, clear token and redirect
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const cancelLogout = () => {
    setIsModalOpen(false);
  };

  return (
    <LogoutContext.Provider value={{ showLogoutModal }}>
      {children}
      <LogoutConfirmModal 
        isOpen={isModalOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </LogoutContext.Provider>
  );
};