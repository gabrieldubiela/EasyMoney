// src/context/HouseholdContextBase.jsx (Ajustado)

import React, { createContext } from 'react';
import useUserAuthData from '../hooks/useUserAuthData'; // NOVO: Importa o hook

export const HouseholdContext = createContext();

export const HouseholdProvider = ({ children }) => {
    // NOVO: Usa o hook para obter o estado do usuário logado e loading
    const { user, loading: userLoading } = useUserAuthData(); 
    
    // O HouseholdId é extraído diretamente do objeto user
    const householdId = user?.householdId || null;
    
    // O loading do contexto deve ser o loading da busca de dados do usuário
    const loading = userLoading; 

    const contextValue = {
        user, // Agora inclui: uid, email, householdId, isAdmin
        householdId,
        loading,
        // ... (outras funções ou estados do contexto)
    };

    if (loading) {
        return <div>Carregando dados de autenticação e perfil...</div>;
    }

    return (
        <HouseholdContext.Provider value={contextValue}>
            {children}
        </HouseholdContext.Provider>
    );
};