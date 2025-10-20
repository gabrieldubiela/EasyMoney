// src/hooks/useMonthlyBalance.js

import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';

export default function useMonthlyBalance(year, month) {
    const { householdId } = useAppContext();
    
    const [effectiveTransactions, setEffectiveTransactions] = useState([]);
    const [plannedTransactions, setPlannedTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch com onSnapshot
    useEffect(() => {
        if (!householdId || !year || !month) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const startTimestamp = Timestamp.fromDate(startOfMonth);
        const endTimestamp = Timestamp.fromDate(endOfMonth);

        // Listener para transações efetivas
        const effectiveQuery = query(
            collection(db, `households/${householdId}/transactions`),
            where('date', '>=', startTimestamp),
            where('date', '<=', endTimestamp)
        );

        const unsubEffective = onSnapshot(effectiveQuery, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setEffectiveTransactions(transactions);
        });

        // Listener para transações planejadas
        const plannedQuery = query(
            collection(db, `households/${householdId}/plannedTransactions`),
            where('paymentDate', '>=', startTimestamp),
            where('paymentDate', '<=', endTimestamp)
        );

        const unsubPlanned = onSnapshot(plannedQuery, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setPlannedTransactions(transactions);
        });

        // Listener para categorias
        const categoriesQuery = collection(db, `households/${householdId}/categories`);
        const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setCategories(cats);
        });

        // Listener para tipos
        const typesQuery = collection(db, `households/${householdId}/types`);
        const unsubTypes = onSnapshot(typesQuery, (snapshot) => {
            const typs = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setTypes(typs);
            setLoading(false);
        });

        // Cleanup - desinscrever de todos os listeners
        return () => {
            unsubEffective();
            unsubPlanned();
            unsubCategories();
            unsubTypes();
        };
    }, [householdId, year, month]);

    // Separar receitas e despesas usando useMemo
    const financialData = useMemo(() => {
        const incomeEffective = effectiveTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenseEffective = effectiveTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const incomePlanned = plannedTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expensePlanned = plannedTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            incomeEffective,
            expenseEffective,
            incomePlanned,
            expensePlanned
        };
    }, [effectiveTransactions, plannedTransactions]);

    return {
        effectiveTransactions,
        plannedTransactions,
        categories,
        types,
        ...financialData,
        loading
    };
}