// src/hooks/useAllTransactions.js

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook responsável por buscar todas as transações (reais ou planejadas),
 * com suporte a filtros dinâmicos e paginação opcional.
 *
 * - Mantém atualização em tempo real via onSnapshot.
 * - Permite paginação usando cursores Firestore (limit, startAfter).
 * - Suporta filtros por categoria, tipo, usuário, intervalo de datas e valores.
 *
 * @param {object} filters - Parâmetros opcionais:
 *   planned: boolean
 *   categoryId, typeId, userId, yearMonth
 *   startDate, endDate, minAmount, maxAmount
 *   orderByField, orderDirection
 *   limit: número máximo de resultados por página
 * @returns {object} { transactions, loading, error, loadMore, hasMore }
 */
const getCollectionPath = (householdId, planned = false) =>
  planned
    ? `households/${householdId}/plannedTransactions`
    : `households/${householdId}/transactions`;

export default function useAllTransactions(filters = {}) {
  const { householdId } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const unsubscribeRef = useRef(null);

  /**
   * Função auxiliar para construir a query base com filtros atuais.
   */
  const buildQuery = useCallback(
    (startAfterDoc = null) => {
      if (!householdId) return null;

      const path = getCollectionPath(householdId, filters.planned || false);
      const colRef = collection(db, path);
      const conditions = [];

      // Filtros dinâmicos
      if (filters.categoryId) conditions.push(where('category_id', '==', filters.categoryId));
      if (filters.typeId) conditions.push(where('type_id', '==', filters.typeId));
      if (filters.userId) conditions.push(where('user_id', '==', filters.userId));
      if (filters.yearMonth) conditions.push(where('yearMonth', '==', filters.yearMonth));
      if (filters.startDate) conditions.push(where('date', '>=', new Date(filters.startDate)));
      if (filters.endDate) conditions.push(where('date', '<=', new Date(filters.endDate)));
      if (filters.minAmount) conditions.push(where('amount', '>=', filters.minAmount));
      if (filters.maxAmount) conditions.push(where('amount', '<=', filters.maxAmount));

      // Ordenação e paginação
      const orderField = filters.orderByField || 'date';
      const orderDirection = filters.orderDirection || 'desc';
      const pageLimit = filters.limit || 20;

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

  /**
   * Função principal: executa a query inicial e inscreve listener em tempo real.
   */
  useEffect(() => {
    if (!householdId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = buildQuery();

    if (unsubscribeRef.current) {
      unsubscribeRef.current(); // limpa listeners anteriores
    }

    if (!q) return;

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions(docs);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === (filters.limit || 20));
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao buscar transações:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [householdId, buildQuery]);

  /**
   * Paginação: carrega mais resultados (próxima página)
   */
  const loadMore = async () => {
    if (!lastDoc) return;

    const q = buildQuery(lastDoc);

    onSnapshot(
      q,
      (snapshot) => {
        const moreDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTransactions((prev) => [...prev, ...moreDocs]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === (filters.limit || 20));
      },
      (err) => console.error('Erro ao carregar mais transações:', err)
    );
  };

  return { transactions, loading, error, hasMore, loadMore };
}
