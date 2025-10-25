// src/App.jsx

import React, { useEffect } from 'react';
import { requestNotificationPermission } from './utils/notification';
import { AppProvider } from './context/AppContext';
import AppRoutes from './pages/Routes';
import useRealtimeAlertManager from './hooks/useRealtimeAlertManager';
import useAppContext from './context/useAppContext';
import './index.css';

// Componente que usa hooks globais dentro do contexto
const AppContent = () => {
  const { loading } = useAppContext();

  // Monitoramento automático de alertas
  useRealtimeAlertManager({
    selectedYear: new Date().getFullYear(),
    yearMonth: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    annualData: {}
  });

  if (loading) {
    return (
      <div>
        Carregando...
      </div>
    );
  }

  return <AppRoutes/>;
};

// Componente Principal App
function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <AppProvider>
      <AppContent/>
    </AppProvider>
  );
}

export default App;
