import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';
import { HouseholdContext } from './HouseholdContext'; 
import useUserAuthData from '../hooks/useUserAuthData';

// ✅ Este arquivo AGORA exporta APENAS o componente Provider
const HouseholdProvider = ({ children }) => {
    // Usa o hook para obter o estado do usuário logado e loading
    const { user, loading: userLoading } = useUserAuthData();
    const [familyName, setFamilyName] = useState(null); 
    
    // O HouseholdId é extraído diretamente do objeto user
    const householdId = user?.householdId || null;
    
    // O loading do contexto deve ser o loading da busca de dados do usuário
    const loading = userLoading; 

    // Busca o nome da família baseado no householdId
    useEffect(() => {
        async function fetchFamilyName() {
            if (!householdId) {
                setFamilyName(null);
                return;
            }

            try {
                // 1. Cria a referência ao documento da household
                const householdDocRef = doc(db, 'households', householdId);
                
                // 2. Busca o documento
                const docSnap = await getDoc(householdDocRef);

                if (docSnap.exists()) {
                    // 3. Extrai o nome e salva no estado
                    setFamilyName(docSnap.data().familyName || 'Minha Família');
                } else {
                    console.warn(`Documento da Household ID ${householdId} não encontrado!`);
                    setFamilyName('Não Encontrado');
                }
            } catch (error) {
                console.error("Erro ao buscar nome da família:", error);
                setFamilyName('Erro de Busca');
            }
        }

        // Se o user já foi carregado e tem um householdId, execute a busca.
        if (!loading && householdId) {
            fetchFamilyName();
        } else if (!loading && !householdId) {
             // Caso o usuário esteja logado mas não pertença a uma casa
            setFamilyName('Sem Família');
        }

    }, [householdId, loading]);

    const contextValue = {
        user, // Inclui: uid, email, householdId, isAdmin
        householdId,
        familyName,
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

export default HouseholdProvider;