// src/hooks/useAllPlannedTransactions.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook para escutar transações planejadas com filtros opcionais.
 *
 * @param {object} filters - campos opcionais para filtrar: categoryId, typeId, userId, yearMonth, startDate, endDate, minAmount, maxAmount
 * @returns {object} { transactions, loading, error }
 */
const useAllPlannedTransactions = (filters = {}) => {
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

    const path = `households/${householdId}/plannedTransactions`;
    const ref = collection(db, path);

    // Build conditions
    const conditions = [];
    if (filters.categoryId) conditions.push(where('category_id', '==', filters.categoryId));
    if (filters.typeId) conditions.push(where('type_id', '==', filters.typeId));
    if (filters.userId) conditions.push(where('user_id', '==', filters.userId));
    if (filters.yearMonth) conditions.push(where('yearMonth', '==', filters.yearMonth));
    if (filters.startDate) conditions.push(where('date', '>=', new Date(filters.startDate)));
    if (filters.endDate) conditions.push(where('date', '<=', new Date(filters.endDate)));
    if (filters.minAmount) conditions.push(where('amount', '>=', filters.minAmount));
    if (filters.maxAmount) conditions.push(where('amount', '<=', filters.maxAmount));

    const plannedQuery =
      conditions.length > 0
        ? query(ref, ...conditions, orderBy(filters.orderByField || 'date', filters.orderDirection || 'asc'))
        : query(ref, orderBy(filters.orderByField || 'date', filters.orderDirection || 'asc'));

    const unsubscribe = onSnapshot(
      plannedQuery,
      (snapshot) => {
        setTransactions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar plannedTransactions:', err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [
    householdId,
    filters.categoryId,
    filters.typeId,
    filters.userId,
    filters.yearMonth,
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
    filters.orderByField,
    filters.orderDirection,
  ]);

  return { transactions, loading, error };
};

export default useAllPlannedTransactions;
