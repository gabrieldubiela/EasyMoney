// src/App.jsx

import React, { useEffect } from 'react';
import { requestNotificationPermission } from './utils/notification';
import HouseholdProvider from './context/HouseholdProvider'; 
import AppRoutes from './routes/Routes'; 
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
        <HouseholdProvider>
            <AppContent />
        </HouseholdProvider>
    );
}

export default App;