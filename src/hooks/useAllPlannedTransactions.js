// src/hooks/useAllPlannedTransactions.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook para escutar todas as transações planejadas (plannedTransactions) em tempo real.
 * Retorna atualização automática quando qualquer transação planejada é criada, editada ou removida.
 *
 * @returns {object} { transactions, loading, error }
 */
const useAllPlannedTransactions = () => {
  const { householdId } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const plannedRef = collection(db, `households/${householdId}/plannedTransactions`);

    const unsubscribe = onSnapshot(
      plannedRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar transações planejadas:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId]);

  return { transactions, loading, error };
};

export default useAllPlannedTransactions;
