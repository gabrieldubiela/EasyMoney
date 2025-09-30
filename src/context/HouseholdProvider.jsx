import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig'; 
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { HouseholdContext } from './HouseholdContext'; 
import useUserAuthData from '../hooks/useUserAuthData';

const HouseholdProvider = ({ children }) => {
    const { user, loading: userLoading } = useUserAuthData();
    const [familyName, setFamilyName] = useState(null);
    const [users, setUsers] = useState([]); // NOVO: lista de usuários
    
    const householdId = user?.householdId || null;
    const loading = userLoading;

    // Busca o nome da família
    useEffect(() => {
        async function fetchFamilyName() {
            if (!householdId) {
                setFamilyName(null);
                return;
            }

            try {
                const householdDocRef = doc(db, 'households', householdId);
                const docSnap = await getDoc(householdDocRef);

                if (docSnap.exists()) {
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

        if (!loading && householdId) {
            fetchFamilyName();
        } else if (!loading && !householdId) {
            setFamilyName('Sem Família');
        }
    }, [householdId, loading]);

    // NOVO: Busca lista de usuários da household
    useEffect(() => {
        if (!householdId) {
            setUsers([]);
            return;
        }

        // Query para buscar todos os usuários desta household
        const usersQuery = query(
            collection(db, 'users'),
            where('householdId', '==', householdId)
        );

        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                uid: doc.id,
                displayName: doc.data().firstName || 'Sem Nome',
                email: doc.data().email,
                ...doc.data()
            }));
            setUsers(usersList);
        }, (error) => {
            console.error('Erro ao buscar usuários:', error);
        });

        return () => unsubscribe();
    }, [householdId]);

    const contextValue = {
        user,
        householdId,
        familyName,
        users, // NOVO: disponibiliza lista de usuários
        loading,
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