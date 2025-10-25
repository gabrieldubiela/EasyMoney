import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '../context/useAppContext';

export default function useMonthlyPerformanceData({
  yearMonth,
  annualData,
  categories,
  types,
}) {
  const { householdId } = useAppContext();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Estabiliza annualData com useMemo
  const stableAnnualData = useMemo(() => annualData, [JSON.stringify(annualData)]);

  // Listener 1: Transações
  useEffect(() => {
    if (!householdId || !yearMonth) {
      setTransactions([]);
      return;
    }

    const transactionsRef = collection(db, `households/${householdId}/transactions`);
    const transactionsQuery = query(transactionsRef, where('yearMonth', '==', yearMonth));

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar transações:', error);
        setTransactions([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, yearMonth]);

  // Listener 2: Orçamentos
  useEffect(() => {
    if (!householdId || !yearMonth) {
      setBudgets({});
      return;
    }

    const year = yearMonth.slice(0, 4);
    const budgetsRef = collection(db, `households/${householdId}/budgets/${year}/categories`);

    const unsubscribe = onSnapshot(
      budgetsRef,
      (snap) => {
        const budgetsMap = Object.fromEntries(
          snap.docs.map(doc => {
            const data = doc.data();
            return [data.categoryId, { id: doc.id, ...data }];
          })
        );
        setBudgets(budgetsMap);
      },
      (error) => {
        console.error('Erro ao carregar orçamentos:', error);
        setBudgets({});
      }
    );

    return () => unsubscribe();
  }, [householdId, yearMonth]);

  // Calcula performance usando stableAnnualData
  const performance = useMemo(() => {
    if (!categories.length || !types.length) {
      return {};
    }

    const realSpentByCategory = {};
    transactions.forEach(transaction => {
      const typeInfo = types.find(t => t.id === transaction.type_id);

      if (transaction.category_id && typeInfo && !typeInfo.isIncome) {
        realSpentByCategory[transaction.category_id] = 
          (realSpentByCategory[transaction.category_id] || 0) + transaction.amount;
      }
    });

    const newPerformance = {};

    categories.forEach(category => {
      const catId = category.id;
      const annualGoal = stableAnnualData[catId]?.goalAmount || 0; // ✅ Usa stableAnnualData
      const monthlyBaseGoal = annualGoal / 12;

      const monthlyBudget = budgets[catId];
      const adjustedGoal = monthlyBudget?.goalAmount ?? monthlyBaseGoal;
      const rollover = monthlyBudget?.rollover || 0;

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
        remaining: totalAvailable + realSpent,
        isOverBudget: -realSpent > totalAvailable,
        monthlyBudgetId: monthlyBudget?.id || null,
      };
    });

    return newPerformance;
  }, [
    transactions,
    budgets,
    categories,
    types,
    stableAnnualData // ✅ Dependência estável
  ]);

  return { performance, loading };
}
