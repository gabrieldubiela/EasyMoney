// src/App.jsx

import React, { useEffect } from 'react';
import { requestNotificationPermission } from './utils/notification';
import { AppProvider } from './context/AppContext';
import AppRoutes from './pages/Routes';
import useScheduledPayments from './hooks/useScheduledPayments';
import useRealtimeAlertManager from './hooks/useRealtimeAlertManager';
import './index.css';

// Componente que usa hooks globais dentro do contexto
const AppContent = () => {
  useScheduledPayments();

  // Novo: adiciona monitoramento automático de alertas
  useRealtimeAlertManager({
    selectedYear: new Date().getFullYear(),
    yearMonth: `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    annualData: {}
  });

  return <AppRoutes />;
};

// Componente Principal App
function App() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
