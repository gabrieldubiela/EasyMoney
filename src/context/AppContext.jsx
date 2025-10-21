//src/context/AppContext.jsx
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Criar o contexto
const AppContext = createContext(null);

// Hook customizado
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};

// Provider principal
export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [familyName, setFamilyName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detecta login/logout automaticamente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        setUserId(uid);

        // Busca householdId padrão do Firestore
        try {
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            // O campo 'households' pode ser um array de ids
            const defaultHousehold = Array.isArray(data.households)
              ? data.households[0]
              : data.households || null;
            const name = data.name || null;
            setUserName(name);
            const familyName = data.familyName || null;
            setFamilyName(familyName);
            setHouseholdId(defaultHousehold);
          }
        } catch (error) {
          console.error('Erro ao buscar householdId:', error);
        }
      } else {
        // Logout
        setUserId(null);
        setHouseholdId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função para trocar de família manualmente
  const changeHousehold = (newHouseholdId) => {
    setHouseholdId(newHouseholdId);
  };

  return (
    <AppContext.Provider
      value={{
        userId,
        householdId,
        userName,
        familyName,
        changeHousehold,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
