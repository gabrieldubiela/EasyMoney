// src/hooks/useMonthlyBudgetPerformance.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    getDocs,      
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from 'firebase/firestore'; 
import { useHousehold } from '../hooks/useHousehold';
import useAnnualData from './useAnnualData'; 
import useCategories from './useCategories'; 
import useTypes from './useTypes';


/**
 * Hook para consolidar a performance orçamentária mensal (Meta Base, Rollover, Gasto Real).
 */
const useMonthlyBudgetPerformance = (yearMonth) => {
    const { householdId } = useHousehold();
    const { categories } = useCategories();
    const { types } = useTypes(); // Lista de Tipos para verificar isIncome
    
    // Assumimos que o useAnnualData recebe o ano (ex: 2025)
    const { annualData, loading: annualLoading } = useAnnualData(yearMonth ? yearMonth.substring(0, 4) : null);
    
    const [performance, setPerformance] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!householdId || !yearMonth || annualLoading || categories.length === 0 || types.length === 0) {
            setLoading(annualLoading || categories.length === 0 || types.length === 0);
            return;
        }

        // 1. QUERY para Transações do Mês
        const transactionsRef = collection(db, `households/${householdId}/transactions`);
        const qTransactions = query(
            transactionsRef,
            where('yearMonth', '==', yearMonth)
        );

        // 2. QUERY para Metas Mensais Ajustadas/Rollover
        const budgetsRef = collection(db, `households/${householdId}/monthlyBudgets`);
        const qBudgets = query(
            budgetsRef,
            where('yearMonth', '==', yearMonth)
        );

        let transactionsList = [];
        let budgetsList = [];
        let unsubscribeTransactions = () => {};
        let unsubscribeBudgets = () => {};

        // 3. Monitorar Transações e Metas Mensais
        unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
            transactionsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            recalculatePerformance();
        });

        unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
            budgetsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            recalculatePerformance();
        });


        // 4. Lógica Principal de Recálculo
        const recalculatePerformance = () => {
            const newPerformance = {};
            const realSpentByCategory = {};

            // A. Calcular Gasto Real (Despesas)
            transactionsList
                .filter(t => t.type === 'expense' && t.category?.id) // Apenas despesas com category.id
                .forEach(t => {
                    const catId = t.category.id;
                    const amount = t.amount || 0;
                    realSpentByCategory[catId] = (realSpentByCategory[catId] || 0) + amount;
                });

            // B. Consolidar Dados por Categoria
            let alertMessages = [];
            categories.forEach(category => {
                const catId = category.id;
                
                // 1. Meta Base (Anual / 12)
                const annualGoal = annualData[catId]?.goalAmount || 0;
                const monthlyBaseGoal = annualGoal / 12;
                
                // 2. Meta Mensal Ajustada/Rollover
                const monthlyBudgetDoc = budgetsList.find(b => b.categoryId === catId);
                const adjustedGoal = monthlyBudgetDoc?.goalAmount || monthlyBaseGoal;
                const rollover = monthlyBudgetDoc?.rollover || 0;
                
                // 3. Gasto Real
                const realSpent = realSpentByCategory[catId] || 0;

                // 4. Consolidação
                newPerformance[catId] = {
                    categoryId: catId,
                    categoryName: category.name,
                    typeId: category.typeId,
                    
                    // Metas
                    monthlyBaseGoal: monthlyBaseGoal,
                    adjustedGoal: adjustedGoal,
                    rollover: rollover,
                    totalAvailable: adjustedGoal + rollover,
                    
                    // Performance
                    realSpent: realSpent,
                    remaining: (adjustedGoal + rollover) - realSpent,
                    isOverBudget: realSpent > (adjustedGoal + rollover),
                    monthlyBudgetId: monthlyBudgetDoc?.id || null,
                };

            

            setPerformance(newPerformance);
            setLoading(false);
        });
        };

        // Limpeza dos listeners
        return () => {
            unsubscribeTransactions();
            unsubscribeBudgets();
        };

    }, [householdId, yearMonth, annualLoading, categories, annualData, types]); // Adicionado 'types' na dependência

    return { 
        performance, 
        loading
    };
};

export default useMonthlyBudgetPerformance;