// src/hooks/useMonthlyBalance.js

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';

const useMonthlyBalance = (year, month) => {
    const { householdId } = useHousehold();
    
    // Dados
    const [availableFunds, setAvailableFunds] = useState(0);
    const [effectiveTransactions, setEffectiveTransactions] = useState([]);
    const [plannedTransactions, setPlannedTransactions] = useState([]);  
    const [categories, setCategories] = useState({});
    const [types, setTypes] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch principal
    const fetchTransactionsForPeriod = useCallback(async () => {
        if (!householdId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0); 
        const startTimestamp = Timestamp.fromDate(startOfMonth);
        const endTimestamp = Timestamp.fromDate(endOfMonth);

        try {
            // --- Fetch Despesas Efetivas ('Transactions') ---
            const effectiveQuery = query(
                collection(db, `households/${householdId}/transactions`),
                where('date', '>=', startTimestamp),
                where('date', '<=', endTimestamp),
                orderBy('date', 'asc')
            );
            const effectiveSnapshot = await getDocs(effectiveQuery);
            setEffectiveTransactions(effectiveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // --- Fetch Despesas Planejadas ('plannedTransactions') ---
            const plannedQuery = query(
                collection(db, `households/${householdId}/plannedTransactions`),
                where('paymentDate', '>=', startTimestamp),
                where('paymentDate', '<=', endTimestamp),
                orderBy('paymentDate', 'asc')
            );
            const plannedSnapshot = await getDocs(plannedQuery);
            setPlannedTransactions(plannedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
        } catch(error) {
            console.error("Erro ao carregar despesas do balanço:", error);
        } finally {
            setLoading(false);
        }
    }, [householdId, year, month]);

    useEffect(() => {
        fetchTransactionsForPeriod();
    }, [fetchTransactionsForPeriod]);
    
    // Lógica para o fetch de Categorias/Tipos (poderia estar em outro hook, mas mantemos aqui por simplicidade)
    useEffect(() => {
        // ... (o código de fetch de categories/types usando onSnapshot - deixei de fora para foco, mas seria copiado do monthlybalancepage)
    }, [householdId]);


    const totalEffective = effectiveTransactions.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPlanned = plannedTransactions.reduce((sum, exp) => sum + exp.amount, 0);
    const balance = availableFunds - totalEffective - totalPlanned;

    return {
        availableFunds, setAvailableFunds,
        effectiveTransactions, totalEffective,
        plannedTransactions, totalPlanned,
        balance,
        categories, types,
        loading,
        refetch: fetchTransactionsForPeriod // Função para forçar a atualização após uma conversão/adição
    };
};

export default useMonthlyBalance;