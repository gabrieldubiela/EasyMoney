// src/hooks/useAllTransactions.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook para escutar todas as transações reais (transactions) em tempo real.
 * Retorna atualizações automáticas sempre que há criação, edição ou remoção.
 *
 * @returns {object} { transactions, loading, error }
 */
const useAllTransactions = () => {
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
    const transactionsRef = collection(db, `households/${householdId}/transactions`);

    const unsubscribe = onSnapshot(
      transactionsRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar transações:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId]); // recria listener se mudar de família

  return { transactions, loading, error };
};

export default useAllTransactions;
