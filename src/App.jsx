// src/App.jsx

import React, { useEffect } from 'react';
import { requestNotificationPermission } from './utils/notification';
import { AppProvider } from './context/AppContext';
import AppRoutes from './pages/Routes'; 
import useScheduledPayments from './hooks/useScheduledPayments';
import './index.css';

// Componente que usa os hooks dentro do contexto
const AppContent = () => {
    useScheduledPayments();
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