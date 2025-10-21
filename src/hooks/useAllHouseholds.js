// src/hooks/useAllHouseholds.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Hook para escutar todas as famílias em tempo real.
 * Atualiza automaticamente quando qualquer família é criada, editada ou removida.
 *
 * @returns {object} { households, loading, error }
 */
const useAllHouseholds = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const householdsRef = collection(db, 'households');

    const unsubscribe = onSnapshot(
      householdsRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHouseholds(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar famílias:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { households, loading, error };
};

export default useAllHouseholds;
