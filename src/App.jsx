// src/App.jsx

import React, { useEffect } from 'react';

// Importa a função de utilitário de notificação que criamos
import { requestNotificationPermission } from './utils/notification';

// Ajuste o caminho de importação do Contexto se necessário.
import HouseholdProvider from './context/HouseholdContext'; 

// Importa o roteador da aplicação
import AppRoutes from './routes/Routes'; 
import useScheduledPayments from './hooks/useScheduledPayments';

import './index.css';

// Componente Principal App (Define o Provedor)
function App() {
    
    // 1. Hook para solicitar a permissão de notificação
    useEffect(() => {
        // Esta função irá verificar a permissão e pedir ao usuário, se necessário.
        requestNotificationPermission(); 
    }, []); // O array vazio garante que isso rode apenas uma vez, após a montagem.

    useScheduledPayments();
    
    // 2. Renderização
    return (
        <HouseholdProvider>
            {/* O componente AppRoutes contém todo o roteamento */}
            <AppRoutes />
        </HouseholdProvider>
    );
}

export default App;