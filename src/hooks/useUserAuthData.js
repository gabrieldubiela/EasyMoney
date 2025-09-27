// src/hooks/useUserAuthData.js

import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig'; // Assumindo que você tem auth e db importados aqui
import { doc, onSnapshot } from 'firebase/firestore'; 

const useUserAuthData = () => {
    const [user, setUser] = useState(null); // Objeto do usuário (inclui isAdmin e householdId)
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        let unsubscribeUser = () => {};
        
        // 1. Monitora o estado de autenticação do Firebase (se o usuário está logado)
        const unsubscribeAuth = auth.onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                // Usuário está logado, agora busca o perfil do Firestore
                
                const userRef = doc(db, 'users', firebaseUser.uid);
                
                // 2. Monitora o perfil do usuário no Firestore (para isAdmin e householdId)
                unsubscribeUser = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        
                        // Combina os dados do Auth e do Firestore
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            householdId: userData.householdId || null, // Importante para o useHousehold
                            isAdmin: userData.isAdmin || false,       // A flag de Admin!
                            ...userData,
                        });
                    } else {
                        // Perfil não existe no Firestore (caso de primeiro login)
                        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, isAdmin: false, householdId: null });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Erro ao buscar perfil do usuário:", error);
                    setLoading(false);
                });

            } else {
                // Usuário deslogado
                setUser(null);
                setLoading(false);
                unsubscribeUser(); // Garante que a escuta do perfil pare
            }
        });

        // Limpeza: Garante que as escutas parem quando o componente for desmontado
        return () => {
            unsubscribeAuth();
            unsubscribeUser();
        };
    }, []);

    return { user, loading };
};

export default useUserAuthData;