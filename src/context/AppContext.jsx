// src/context/AppContext.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { AppContext } from './appContextValue';
import { fetchUserData } from '../services/userService';
import { fetchHouseholdData } from '../services/householdService';

export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [familyName, setFamilyName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detecta login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const uid = user.uid;
        setUserId(uid);

        try {
          // Busca dados do usuário via userService
          const userData = await fetchUserData(uid);
          const defaultHousehold = Array.isArray(userData.households)
            ? userData.households[0]
            : userData.households || null;
          setUserName(userData.name || null);
          setHouseholdId(defaultHousehold);

          // Busca dados da família via householdService, se houver householdId
          if (defaultHousehold) {
            try {
              const householdData = await fetchHouseholdData(defaultHousehold);
              setFamilyName(householdData.family_name || null);
            } catch (error) {
              setFamilyName(null);
              console.error('Erro ao buscar dados da família:', error);
            }
          } else {
            setFamilyName(null);
          }
        } catch (error) {
          setUserName(null);
          setHouseholdId(null);
          setFamilyName(null);
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        // Logout
        setUserId(null);
        setHouseholdId(null);
        setUserName(null);
        setFamilyName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Troca manual de família (id)
  const changeHousehold = async (newHouseholdId) => {
    setHouseholdId(newHouseholdId);
    setLoading(true);
    try {
      const householdData = await fetchHouseholdData(newHouseholdId);
      setFamilyName(householdData.family_name || null);
    } catch (error) {
      setFamilyName(null);
      console.error('Erro ao trocar família:', error);
    }
    setLoading(false);
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
