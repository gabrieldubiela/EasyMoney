// src/hooks/useTransactionList.js - COM ATUALIZAÇÃO EM TEMPO REAL

import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { useHousehold } from '../hooks/useHousehold';

const PAGE_SIZE = 15; // Aumentado para carregar mais de uma vez

export function useTransactionList(filters) {
    const { householdId } = useHousehold();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const filtersRef = useRef(filters);
    
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Usar onSnapshot para atualização em tempo real
    useEffect(() => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const currentFilters = filtersRef.current;

        try {
            let baseQueryConstraints = [];
            
            if (currentFilters.category) {
                baseQueryConstraints.push(where('category_id', '==', currentFilters.category));
            }
            if (currentFilters.type) {
                baseQueryConstraints.push(where('type_id', '==', currentFilters.type));
            }

            baseQueryConstraints.push(orderBy('date', 'desc'));
            baseQueryConstraints.push(limit(PAGE_SIZE));

            const q = query(
                collection(db, `households/${householdId}/transactions`),
                ...baseQueryConstraints
            );

            // Usar onSnapshot para atualização em tempo real
            const unsubscribe = onSnapshot(q, (snapshot) => {
                let newTransactions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filtros client-side
                if (currentFilters.minDate) {
                    const minDateObj = new Date(currentFilters.minDate);
                    newTransactions = newTransactions.filter(t => {
                        const transactionDate = t.date?.toDate();
                        return transactionDate >= minDateObj;
                    });
                }
                if (currentFilters.maxDate) {
                    const maxDateObj = new Date(currentFilters.maxDate);
                    maxDateObj.setHours(23, 59, 59, 999);
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

                setTransactions(newTransactions);
                setLoading(false);
            }, (error) => {
                console.error('Erro ao carregar transações:', error);
                setLoading(false);
            });

            return () => unsubscribe();

        } catch (error) {
            console.error('Erro ao criar query:', error);
            setLoading(false);
        }
    }, [householdId, filters]); // Reage a mudanças nos filtros

    return { transactions, loading, hasMore: false, loadMore: () => {} };
}