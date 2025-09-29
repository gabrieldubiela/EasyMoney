// src/hooks/useMonthlyBalance.js

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';

// O hook agora recebe availableFunds como argumento para calcular o balanço
export default function useMonthlyBalance(year, month, availableFunds) {
    const { householdId } = useHousehold();
    
    // Dados
    const [effectiveTransactions, setEffectiveTransactions] = useState([]);
    const [plannedTransactions, setPlannedTransactions] = useState([]);  
    const [loading, setLoading] = useState(true);

    // Fetch principal
    const fetchTransactionsForPeriod = useCallback(async () => {
        if (!householdId || !year || !month) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59); // Garante pegar o dia todo
        const startTimestamp = Timestamp.fromDate(startOfMonth);
        const endTimestamp = Timestamp.fromDate(endOfMonth);

        try {
            // Fetch Transações Efetivas
            const effectiveQuery = query(
                collection(db, `households/${householdId}/transactions`),
                where('date', '>=', startTimestamp),
                where('date', '<=', endTimestamp)
            );
            const effectiveSnapshot = await getDocs(effectiveQuery);
            setEffectiveTransactions(effectiveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch Transações Planejadas
            const plannedQuery = query(
                collection(db, `households/${householdId}/plannedTransactions`),
                where('paymentDate', '>=', startTimestamp),
                where('paymentDate', '<=', endTimestamp)
            );
            const plannedSnapshot = await getDocs(plannedQuery);
            setPlannedTransactions(plannedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
        } catch(error) {
            console.error("Erro ao carregar transações do balanço:", error);
        } finally {
            setLoading(false);
        }
    }, [householdId, year, month]);

    useEffect(() => {
        fetchTransactionsForPeriod();
    }, [fetchTransactionsForPeriod]);

    // Cálculos são feitos aqui
    const totalEffective = effectiveTransactions.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPlanned = plannedTransactions.reduce((sum, exp) => sum + exp.amount, 0);
    // O balanço agora usa o availableFunds recebido como argumento
    const balance = availableFunds + totalEffective + totalPlanned; // Receitas são +, despesas são -

    return {
        effectiveTransactions, 
        totalEffective,
        plannedTransactions, 
        totalPlanned,
        balance,
        loading,
        refetch: fetchTransactionsForPeriod
    };
};