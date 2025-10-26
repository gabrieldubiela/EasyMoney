// src/hooks/useAllTransactions.js

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

function getCollectionPath(householdId, planned = false) {
  return planned
    ? `households/${householdId}/plannedTransactions`
    : `households/${householdId}/transactions`;
}

export default function useAllTransactions(filters = {}) {
  const { householdId } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const unsubscribeRef = useRef(null);

  // ✅ Estabiliza filters com useMemo
  const stableFilters = useMemo(
    () => filters,
    [JSON.stringify(filters)]
  );

  // Query builder do Firestore
  const buildQuery = useCallback(
    (startAfterDoc = null, customLimit) => {
      if (!householdId) return null;

      const path = getCollectionPath(householdId, stableFilters.planned || false);
      const colRef = collection(db, path);
      const conditions = [];

      if (stableFilters.categoryId) conditions.push(where('category_id', '==', stableFilters.categoryId));
      if (stableFilters.typeId) conditions.push(where('type_id', '==', stableFilters.typeId));
      if (typeof stableFilters.userId !== 'undefined' && stableFilters.userId !== null && stableFilters.userId !== '') {
        conditions.push(where('user_id', '==', stableFilters.userId));
      }
      if (stableFilters.yearMonth) conditions.push(where('yearMonth', '==', stableFilters.yearMonth));
      if (stableFilters.startDate) conditions.push(where('date', '>=', new Date(stableFilters.startDate)));
      if (stableFilters.endDate) conditions.push(where('date', '<=', new Date(stableFilters.endDate)));
      if (stableFilters.minAmount) conditions.push(where('amount', '>=', stableFilters.minAmount));
      if (stableFilters.maxAmount) conditions.push(where('amount', '<=', stableFilters.maxAmount));

      const orderField = stableFilters.orderByField || 'date';
      const orderDirection = stableFilters.orderDirection || 'desc';
      const pageLimit =
        typeof stableFilters.limit !== 'undefined'
          ? stableFilters.limit
          : typeof customLimit !== 'undefined'
            ? customLimit
            : 99999999;

      const queryConstraints = [
        ...conditions,
        orderBy(orderField, orderDirection),
        limit(pageLimit)
      ];

      if (startAfterDoc) queryConstraints.push(startAfter(startAfterDoc));

      return query(colRef, ...queryConstraints);
    },
    [householdId, stableFilters] // ✅ Usa stableFilters
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
      unsubscribeRef.current();
    }

    if (!q) {
      setLoading(false);
      return;
    }

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("🔥 TODAS TRANSAÇÕES CARREGADAS:", docs); // ADICIONE AQUI
        setTransactions(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

        const currentLimit = stableFilters.limit || 15;
        setHasMore(snapshot.docs.length === currentLimit);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar transações:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [householdId, buildQuery, stableFilters.limit]);

  // Soma total global dos filtrados
  useEffect(() => {
    if (!householdId) {
      setTotalAmount(0);
      return;
    }

    const path = getCollectionPath(householdId, stableFilters.planned || false);
    const colRef = collection(db, path);
    const conditions = [];

    if (stableFilters.categoryId) conditions.push(where('category_id', '==', stableFilters.categoryId));
    if (stableFilters.typeId) conditions.push(where('type_id', '==', stableFilters.typeId));
    if (typeof stableFilters.userId !== 'undefined' && stableFilters.userId !== null && stableFilters.userId !== '') {
      conditions.push(where('user_id', '==', stableFilters.userId));
    }
    if (stableFilters.yearMonth) conditions.push(where('yearMonth', '==', stableFilters.yearMonth));
    if (stableFilters.startDate) conditions.push(where('date', '>=', new Date(stableFilters.startDate)));
    if (stableFilters.endDate) conditions.push(where('date', '<=', new Date(stableFilters.endDate)));
    if (stableFilters.minAmount) conditions.push(where('amount', '>=', stableFilters.minAmount));
    if (stableFilters.maxAmount) conditions.push(where('amount', '<=', stableFilters.maxAmount));

    const q = conditions.length ? query(colRef, ...conditions) : colRef;

    const unsubscribeTotal = onSnapshot(
      q,
      (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        setTotalAmount(total);
      },
      (err) => {
        console.error('Erro ao calcular total:', err);
        setTotalAmount(0);
      }
    );

    return () => unsubscribeTotal();
  }, [householdId, stableFilters]);


  // Scroll infinito - carregar mais
  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore || loading) return;

    setLoading(true);

    try {
      const q = buildQuery(lastDoc);

      if (!q) {
        setLoading(false);
        return;
      }

      const snapshot = await getDocs(q);

      const moreDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions((prev) => [...prev, ...moreDocs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);

      const currentLimit = stableFilters.limit || 15;
      setHasMore(snapshot.docs.length === currentLimit);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [buildQuery, lastDoc, hasMore, loading, stableFilters.limit]);


  // Permite reset externo
  const reset = useCallback(() => {
    setTransactions([]);
    setLastDoc(null);
    setHasMore(false);
    setLoading(true);
  }, []);

  return { transactions, totalAmount, loading, error, hasMore, loadMore, reset };
}
