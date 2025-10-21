// src/hooks/useAllTypes.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook para escutar todas as categorias de tipo de transações (types)
 * em tempo real de uma determinada família (household).
 *
 * @returns {object} { types, loading, error }
 */
const useAllTypes = () => {
  const { householdId } = useAppContext();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) {
      setTypes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const typesRef = collection(db, `households/${householdId}/types`);

    const unsubscribe = onSnapshot(
      typesRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTypes(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar tipos:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId]);

  return { types, loading, error };
};

export default useAllTypes;
