import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

const getCollectionPath = (householdId, planned = false) =>
  planned
    ? `households/${householdId}/plannedTransactions`
    : `households/${householdId}/transactions`;

const useAllTransactions = (filters = {}) => {
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
    const path = getCollectionPath(householdId, filters.planned || false);
    const colRef = collection(db, path);

    // Montagem dinâmica das condições da query
    const conditions = [];

    if (filters.categoryId) conditions.push(where('category_id', '==', filters.categoryId));
    if (filters.typeId) conditions.push(where('type_id', '==', filters.typeId));
    if (filters.userId) conditions.push(where('user_id', '==', filters.userId));
    if (filters.yearMonth) conditions.push(where('yearMonth', '==', filters.yearMonth));

    if (filters.startDate) conditions.push(where('date', '>=', new Date(filters.startDate)));
    if (filters.endDate) conditions.push(where('date', '<=', new Date(filters.endDate)));

    if (filters.minAmount) conditions.push(where('amount', '>=', filters.minAmount));
    if (filters.maxAmount) conditions.push(where('amount', '<=', filters.maxAmount));

    // Cria query com condições e ordenação
    const q =
      conditions.length > 0
        ? query(
            colRef,
            ...conditions,
            orderBy(filters.orderByField || 'date', filters.orderDirection || 'asc')
          )
        : query(colRef, orderBy(filters.orderByField || 'date', filters.orderDirection || 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    householdId,
    filters.planned,
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

export default useAllTransactions;
