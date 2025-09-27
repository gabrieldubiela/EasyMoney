// src/hooks/useTransactionList.js

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, orderBy, limit, startAfter, where, getDocs } from 'firebase/firestore';
import { useHousehold } from '../hooks/useHousehold';

const PAGE_SIZE = 15;

export function useTransactionList(filters) {
    const { householdId } = useHousehold();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchTransactions = useCallback(async (isInitialLoad = false, startDoc = null) => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Constrói a Query base
        let baseQueryConstraints = [];
        if (filters.category) {
            baseQueryConstraints.push(where('category_id', '==', filters.category));
        }
        if (filters.type) {
            baseQueryConstraints.push(where('type_id', '==', filters.type));
        }

        // Adiciona ordenação e limite de página
        let q = query(
            collection(db, `households/${householdId}/transactions`),
            ...baseQueryConstraints,
            orderBy('date', 'desc'),
            limit(PAGE_SIZE)
        );

        // Adiciona o cursor para paginação
        if (startDoc) {
            q = query(q, startAfter(startDoc));
        }

        try {
            const snapshot = await getDocs(q);
            let newTransactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filtro client-side para data e texto (termo de busca)
            if (filters.minDate) {
                newTransactions = newTransactions.filter(t => t.date.toDate() >= new Date(filters.minDate));
            }
            if (filters.maxDate) {
                newTransactions = newTransactions.filter(t => t.date.toDate() <= new Date(filters.maxDate));
            }
            if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                newTransactions = newTransactions.filter(t =>
                    t.supplier?.toLowerCase().includes(term) ||
                    t.description?.toLowerCase().includes(term)
                );
            }

            const lastDoc = snapshot.docs[snapshot.docs.length - 1];
            setLastVisible(lastDoc || null);
            setHasMore(snapshot.docs.length === PAGE_SIZE);

            if (isInitialLoad) {
                setTransactions(newTransactions);
            } else {
                setTransactions(prev => [...prev, ...newTransactions]);
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        } finally {
            setLoading(false);
        }
    }, [householdId, filters]);

    // Efeito para re-buscar quando os filtros mudam
    useEffect(() => {
        setTransactions([]);
        setLastVisible(null);
        setHasMore(true);
        fetchTransactions(true);
    }, [filters, fetchTransactions]);

    const loadMore = () => {
        if (!hasMore || loading) return;
        fetchTransactions(false, lastVisible);
    };

    return { transactions, loading, hasMore, loadMore };
}