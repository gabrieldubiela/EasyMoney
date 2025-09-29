// src/hooks/useMonthlyBalance.js

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; 
import { useHousehold } from './useHousehold';
import useCombinedHouseholdData from './useCombinedHouseholdData';
import useFinancialSummary from './useFinancialSummary';

export default function useMonthlyBalance(year, month, availableFunds) {
    const { householdId } = useHousehold();
    const { categories, types } = useCombinedHouseholdData();

    const [effectiveTransactions, setEffectiveTransactions] = useState([]);
    const [plannedTransactions, setPlannedTransactions] = useState([]);  
    const [loading, setLoading] = useState(true);

    const fetchTransactionsForPeriod = useCallback(async () => {
        if (!householdId || !year || !month) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const startTimestamp = Timestamp.fromDate(startOfMonth);
        const endTimestamp = Timestamp.fromDate(endOfMonth);

        try {
            const effectiveQuery = query(
                collection(db, `households/${householdId}/transactions`),
                where('date', '>=', startTimestamp),
                where('date', '<=', endTimestamp)
            );
            const effectiveSnapshot = await getDocs(effectiveQuery);
            setEffectiveTransactions(effectiveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const plannedQuery = query(
                collection(db, `households/${householdId}/plannedTransactions`),
                where('paymentDate', '>=', startTimestamp),
                where('paymentDate', '<=', endTimestamp)
            );
            const plannedSnapshot = await getDocs(plannedQuery);
            setPlannedTransactions(plannedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch(error) {
            console.error("Erro ao carregar transações:", error);
        } finally {
            setLoading(false);
        }
    }, [householdId, year, month]);

    useEffect(() => {
        fetchTransactionsForPeriod();
    }, [fetchTransactionsForPeriod]);

    const summary = useFinancialSummary(effectiveTransactions, plannedTransactions, availableFunds);

    return {
        effectiveTransactions,
        plannedTransactions,
        // Retorna os valores do summary de forma explícita
        incomeEffective: summary.incomeEffective,
        expenseEffective: summary.expenseEffective,
        incomePlanned: summary.incomePlanned,
        expensePlanned: summary.expensePlanned,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        currentBalance: summary.currentBalance,
        projectedBalance: summary.projectedBalance,
        availableBalance: summary.availableBalance,
        // Metadados necessários para a UI
        categories,
        types,
        // Mantém compatibilidade com código existente
        balance: summary,
        totalEffective: summary.currentBalance,
        totalPlanned: summary.incomePlanned - summary.expensePlanned,
        loading,
        refetch: fetchTransactionsForPeriod
    };
}
