// src/hooks/useMonthlyPerformanceData.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { useAppContext } from '../context/AppContext';

/**
 * Hook focado exclusivamente em buscar e consolidar dados de performance orçamentária.
 */
export default function useMonthlyPerformanceData({ yearMonth, annualData, categories, types }) {
    const { householdId } = useAppContext();
    
    const [performance, setPerformance] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!householdId || !yearMonth || !annualData || categories.length === 0 || types.length === 0) {
            setLoading(false);
            return;
        }
        setLoading(true);

        // Listener para transações do mês
        const transactionsQuery = query(
            collection(db, `households/${householdId}/transactions`),
            where('yearMonth', '==', yearMonth)
        );
        
        // Listener para ajustes de orçamento do mês
        const budgetsQuery = query(
            collection(db, `households/${householdId}/monthlyBudgets`),
            where('yearMonth', '==', yearMonth)
        );

        const unsubTransactions = onSnapshot(transactionsQuery, (transactionsSnapshot) => {
            const unsubBudgets = onSnapshot(budgetsQuery, (budgetsSnapshot) => {
                
                const realSpentByCategory = {};
                transactionsSnapshot.docs.forEach(doc => {
                    const t = doc.data();
                    const typeInfo = types.find(typ => typ.id === t.type_id);
                    // Acumula apenas despesas
                    if (t.category_id && typeInfo && !typeInfo.isIncome) {
                        realSpentByCategory[t.category_id] = (realSpentByCategory[t.category_id] || 0) + t.amount;
                    }
                });

                const monthlyBudgetsMap = Object.fromEntries(
                    budgetsSnapshot.docs.map(doc => [doc.data().categoryId, { id: doc.id, ...doc.data() }])
                );
                
                const newPerformance = {};
                categories.forEach(category => {
                    const catId = category.id;
                    const annualGoal = annualData[catId]?.goalAmount || 0;
                    const monthlyBaseGoal = annualGoal / 12;
                    
                    const monthlyBudgetDoc = monthlyBudgetsMap[catId];
                    const adjustedGoal = monthlyBudgetDoc?.goalAmount ?? monthlyBaseGoal;
                    const rollover = monthlyBudgetDoc?.rollover || 0;
                    
                    const realSpent = realSpentByCategory[catId] || 0;
                    const totalAvailable = adjustedGoal + rollover;
                    
                    newPerformance[catId] = {
                        categoryId: catId,
                        categoryName: category.name,
                        monthlyBaseGoal,
                        adjustedGoal,
                        rollover,
                        totalAvailable,
                        realSpent,
                        remaining: totalAvailable + realSpent, // realSpent é negativo
                        isOverBudget: -realSpent > totalAvailable,
                        monthlyBudgetId: monthlyBudgetDoc?.id || null,
                    };
                });
                
                setPerformance(newPerformance);
                setLoading(false);
            });
            return () => unsubBudgets();
        });

        return () => unsubTransactions();

    }, [householdId, yearMonth, annualData, categories, types]);

    return { performance, loading };
};