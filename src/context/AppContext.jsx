// src/context/AppContext.jsx

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { AppContext } from './appContextValue';
import { fetchUserById } from '../services/userService';
import { fetchHouseholdById } from '../services/householdService';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [householdId, setHouseholdId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [familyName, setFamilyName] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detecta login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        setUserId(uid);

        try {
          // Busca dados do usuário via userService
          const userData = await fetchUserById(uid);
          const defaultHouseholdId = Array.isArray(userData.householdId)
            ? userData.householdId[0]
            : userData.householdId || null;
          setUserName(userData.name || null);
          setHouseholdId(defaultHouseholdId);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            ...userData,
          });

          // Busca dados da família via householdService, se houver householdId
          if (defaultHouseholdId) {
            try {
              const householdData = await fetchHouseholdById(defaultHouseholdId);
              setFamilyName(householdData.familyName || null);
            } catch (error) {
              setFamilyName(null);
              console.error('Erro ao buscar dados da família:', error);
            }
          } else {
            setFamilyName(null);
          }
        } catch (error) {
          setUser(firebaseUser);
          setUserName(null);
          setHouseholdId(null);
          setFamilyName(null);
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        // Logout
        setUser(null);
        setUserId(null);
        setHouseholdId(null);
        setUserName(null);
        setFamilyName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Troca manual de família
  const changeHousehold = async (newHouseholdId) => {
    setHouseholdId(newHouseholdId);
    setLoading(true);
    try {
      const householdData = await fetchHouseholdById(newHouseholdId);
      setFamilyName(householdData.familyName || null);
    } catch (error) {
      setFamilyName(null);
      console.error('Erro ao trocar família:', error);
    }
    setLoading(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
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
