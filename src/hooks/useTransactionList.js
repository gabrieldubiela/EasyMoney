// src/hooks/useTransactionList.js - CORRIGIDO

import { useState, useEffect, useCallback, useRef } from 'react';
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
    
    // Usar ref para armazenar filtros e evitar loops
    const filtersRef = useRef(filters);
    
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const fetchTransactions = useCallback(async (isInitialLoad = false, startDoc = null) => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        
        const currentFilters = filtersRef.current;

        try {
            // Constrói a Query base
            let baseQueryConstraints = [];
            
            if (currentFilters.category) {
                baseQueryConstraints.push(where('category_id', '==', currentFilters.category));
            }
            if (currentFilters.type) {
                baseQueryConstraints.push(where('type_id', '==', currentFilters.type));
            }

            // Adiciona ordenação e limite de página
            baseQueryConstraints.push(orderBy('date', 'desc'));
            baseQueryConstraints.push(limit(PAGE_SIZE));

            let q = query(
                collection(db, `households/${householdId}/transactions`),
                ...baseQueryConstraints
            );

            // Adiciona o cursor para paginação
            if (startDoc) {
                q = query(q, startAfter(startDoc));
            }

            const snapshot = await getDocs(q);
            let newTransactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filtro client-side para data e texto (termo de busca)
            if (currentFilters.minDate) {
                const minDateObj = new Date(currentFilters.minDate);
                newTransactions = newTransactions.filter(t => {
                    const transactionDate = t.date?.toDate();
                    return transactionDate >= minDateObj;
                });
            }
            if (currentFilters.maxDate) {
                const maxDateObj = new Date(currentFilters.maxDate);
                maxDateObj.setHours(23, 59, 59, 999); // Final do dia
                newTransactions = newTransactions.filter(t => {
                    const transactionDate = t.date?.toDate();
                    return transactionDate <= maxDateObj;
                });
            }
            if (currentFilters.searchTerm) {
                const term = currentFilters.searchTerm.toLowerCase();
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
            alert('Erro ao carregar transações. Verifique o console.');
        } finally {
            setLoading(false);
        }
    }, [householdId]); // Apenas householdId como dependência

    // Efeito para re-buscar quando os filtros mudam
    useEffect(() => {
        setTransactions([]);
        setLastVisible(null);
        setHasMore(true);
        fetchTransactions(true);
    }, [filters, fetchTransactions, householdId]); // Inclui filters aqui para reagir às mudanças

    const loadMore = () => {
        if (!hasMore || loading) return;
        fetchTransactions(false, lastVisible);
    };

    return { transactions, loading, hasMore, loadMore };
}