// src/hooks/useAllTransactions.js

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Retorna o caminho correto da coleção de transações (reais ou planejadas)
 */
function getCollectionPath(householdId, planned = false) {
  return planned
    ? `households/${householdId}/plannedTransactions`
    : `households/${householdId}/transactions`;
}

/**
 * Hook para buscar transações com filtros, scroll infinito e soma total global (do filtro).
 * 
 * @param {object} filters - Parâmetros opcionais:
 *   planned: boolean
 *   categoryId, typeId, userId, yearMonth
 *   startDate, endDate, minAmount, maxAmount
 *   orderByField, orderDirection
 *   limit: máximo exibido por página (scroll)
 * @returns {object} { transactions, totalAmount, loading, error, hasMore, loadMore, reset }
 */
export default function useAllTransactions(filters = {}) {
  const { householdId } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const unsubscribeRef = useRef(null);

  // Query builder do Firestore
  const buildQuery = useCallback(
    (startAfterDoc = null, customLimit) => {
      if (!householdId) return null;

      const path = getCollectionPath(householdId, filters.planned || false);
      const colRef = collection(db, path);
      const conditions = [];

      if (filters.categoryId) conditions.push(where('category_id', '==', filters.categoryId));
      if (filters.typeId) conditions.push(where('type_id', '==', filters.typeId));
      if (filters.userId) conditions.push(where('user_id', '==', filters.userId));
      if (filters.yearMonth) conditions.push(where('yearMonth', '==', filters.yearMonth));
      if (filters.startDate) conditions.push(where('date', '>=', new Date(filters.startDate)));
      if (filters.endDate) conditions.push(where('date', '<=', new Date(filters.endDate)));
      if (filters.minAmount) conditions.push(where('amount', '>=', filters.minAmount));
      if (filters.maxAmount) conditions.push(where('amount', '<=', filters.maxAmount));

      const orderField = filters.orderByField || 'date';
      const orderDirection = filters.orderDirection || 'desc';
      const pageLimit = customLimit || filters.limit || 15;

      const queryConstraints = [
        ...conditions,
        orderBy(orderField, orderDirection),
        limit(pageLimit)
      ];

      if (startAfterDoc) queryConstraints.push(startAfter(startAfterDoc));

      return query(colRef, ...queryConstraints);
    },
    [householdId, filters]
  );

  // Listener paginado/tempo real
  useEffect(() => {
    if (!householdId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const q = buildQuery();

    if (unsubscribeRef.current) {
      unsubscribeRef.current(); // limpa listeners antigos
    }
    if (!q) return;

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        
        // Corrigido: agora usa filters.limit
        const currentLimit = filters.limit || 15;
        setHasMore(snapshot.docs.length === currentLimit);
        setLoading(false);
      },
      (error) => { // Renomeado de 'err' para 'error'
        setError(error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [householdId, buildQuery, filters.limit]); // Adicionado filters.limit

  // Soma total global dos filtrados (sem limite!)
  useEffect(() => {
    async function fetchTotal() {
      if (!householdId) {
        setTotalAmount(0);
        return;
      }
      try {
        const path = getCollectionPath(householdId, filters.planned || false);
        const colRef = collection(db, path);
        const conditions = [];

        if (filters.categoryId) conditions.push(where('category_id', '==', filters.categoryId));
        if (filters.typeId) conditions.push(where('type_id', '==', filters.typeId));
        if (filters.userId) conditions.push(where('user_id', '==', filters.userId));
        if (filters.yearMonth) conditions.push(where('yearMonth', '==', filters.yearMonth));
        if (filters.startDate) conditions.push(where('date', '>=', new Date(filters.startDate)));
        if (filters.endDate) conditions.push(where('date', '<=', new Date(filters.endDate)));
        if (filters.minAmount) conditions.push(where('amount', '>=', filters.minAmount));
        if (filters.maxAmount) conditions.push(where('amount', '<=', filters.maxAmount));

        const q = conditions.length ? query(colRef, ...conditions) : colRef;
        const snapshot = await getDocs(q);

        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        setTotalAmount(total);
      } catch (error) { // Renomeado para 'error' e agora usado
        console.error('Erro ao calcular total:', error);
        setTotalAmount(0);
      }
    }
    fetchTotal();
  }, [householdId, filters]);

  // Scroll infinito - carregar mais
  const loadMore = useCallback(() => {
    if (!lastDoc || !hasMore) return;
    setLoading(true);
    const q = buildQuery(lastDoc);

    onSnapshot(
      q,
      (snapshot) => {
        const moreDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions((prev) => [...prev, ...moreDocs]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        
        const currentLimit = filters.limit || 15;
        setHasMore(snapshot.docs.length === currentLimit);
        setLoading(false);
      },
      (error) => { // Corrigido: adicionado parâmetro e uso
        console.error('Erro ao carregar mais:', error);
        setLoading(false);
      }
    );
  }, [buildQuery, lastDoc, hasMore, filters.limit]);

  // Permite reset externo
  const reset = useCallback(() => {
    setTransactions([]);
    setLastDoc(null);
    setHasMore(false);
    setLoading(true);
  }, []);

  return { transactions, totalAmount, loading, error, hasMore, loadMore, reset };
}
