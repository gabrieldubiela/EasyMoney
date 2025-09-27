import React from 'react';
// ✅ Importa do arquivo .js simples (para resolver o Fast Refresh)
import { HouseholdContext } from './HouseholdContext'; 
import useUserAuthData from '../hooks/useUserAuthData';

// ✅ Este arquivo AGORA exporta APENAS o componente Provider
export const HouseholdProvider = ({ children }) => {
    // Usa o hook para obter o estado do usuário logado e loading
    const { user, loading: userLoading } = useUserAuthData(); 
    
    // 💡 LÓGICA REINSERIDA:
    // O HouseholdId é extraído diretamente do objeto user
    const householdId = user?.householdId || null;
    
    // O loading do contexto deve ser o loading da busca de dados do usuário
    const loading = userLoading; 

    const contextValue = {
        user, // Inclui: uid, email, householdId, isAdmin
        householdId,
        loading,
        // ... (outras funções ou estados do contexto que você possa ter)
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