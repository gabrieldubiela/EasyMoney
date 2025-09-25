import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// Importa o Contexto do arquivo base
import { HouseholdContext } from './HouseholdContextBase'; 

// 1. Componente Provedor (É o componente que o Fast Refresh deve observar)
const HouseholdProvider = ({ children }) => { 
  const [user, setUser] = useState(null); 
  const [householdId, setHouseholdId] = useState(null); 
  const [currentUserName, setCurrentUserName] = useState('Carregando...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          setHouseholdId(userData.householdId || null);
          setCurrentUserName(userData.firstName || 'Você');
        } else {
          console.error("Documento do usuário não encontrado.");
          setHouseholdId(null);
          setCurrentUserName('Desconhecido');
        }
      } else {
        setUser(null);
        setHouseholdId(null);
        setCurrentUserName('Você');
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const value = {
    user,
    householdId,
    currentUserName,
    isLoading,
  };

  if (isLoading) {
    return <div>Carregando informações do sistema...</div>;
  }
  
  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
};

// 2. Exportação Padrão do Provedor (O ÚNICO EXPORT DESTE ARQUIVO)
export default HouseholdProvider;