import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

function getCollectionPath(householdId, planned = false) {
  return planned
    ? `households/${householdId}/plannedTransactions`
    : `households/${householdId}/transactions`;
}

// Aplica todos os filtros ativos no array de transações
function applyFilters(transactions, filters) {
  return transactions.filter((t) => {
    if (filters.categoryId && t.category_id !== filters.categoryId) return false;
    if (filters.typeId && t.type_id !== filters.typeId) return false;
    if (filters.userId !== undefined && filters.userId !== null && filters.userId !== '' && t.user_id !== filters.userId) return false;
    if (filters.yearMonth && t.yearMonth !== filters.yearMonth) return false;
    if (filters.startDate && t.date < new Date(filters.startDate)) return false;
    if (filters.endDate && t.date > new Date(filters.endDate + 'T23:59:59.999')) return false;
    if (filters.minAmount && t.amount < filters.minAmount) return false;
    if (filters.maxAmount && t.amount > filters.maxAmount) return false;
    // Supplier OU description
    if (filters.supplier || filters.description) {
      const supplier = (filters.supplier || '').trim().toLowerCase();
      const description = (filters.description || '').trim().toLowerCase();
      const supplierMatch = supplier && t.supplier && t.supplier.toLowerCase().includes(supplier);
      const descriptionMatch = description && t.description && t.description.toLowerCase().includes(description);
      if (!(supplierMatch || descriptionMatch)) return false;
    }
    return true;
  });
}

function orderTransactions(transactions) {
  return transactions.slice().sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
    const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export default function useAllTransactions(filters = {}) {
  const { householdId } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Busca e filtra localmente
  const fetchData = useCallback(async () => {
    if (!householdId) {
      setTransactions([]);
      setTotalAmount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const path = getCollectionPath(householdId, filters.planned || false);
      const colRef = collection(db, path);
      const snap = await getDocs(colRef);
      let docs = snap.docs.map((doc) => {
        let d = { id: doc.id, ...doc.data() };
        // Corrige conversão do campo date se vier como timestamp Firestore
        if (d.date && d.date.toDate) d.date = d.date.toDate();
        return d;
      });
      const filtered = applyFilters(docs, filters);
      const ordered = orderTransactions(filtered);
      setTransactions(ordered);
      setTotalAmount(ordered.reduce((sum, t) => sum + (t.amount || 0), 0));
      setLoading(false);
    } catch (err) {
      setTransactions([]);
      setTotalAmount(0);
      setError(err);
      setLoading(false);
    }
  }, [householdId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll infinito e reset não funcionam na busca local
  // Se quiser implementar paginação, precisar segmentar manual, mas assim tudo é local e correto
  const loadMore = useCallback(() => {}, []);
  const reset = useCallback(() => {
    setTransactions([]);
    setTotalAmount(0);
    setLoading(true);
  }, []);

  return { transactions, totalAmount, loading, error, hasMore: false, loadMore, reset };
}
