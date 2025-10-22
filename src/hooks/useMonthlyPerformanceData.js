import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook responsável por consolidar dados de performance orçamentária mensal.
 * 
 * Observa em tempo real transações para o mês e orçamentos anuais por categoria.
 * Retorna estrutura consolidada para cálculo de gastos, metas e saldo disponível.
 *
 * @param {object} params
 * @param {string} params.yearMonth - Mês no formato 'YYYYMM'.
 * @param {object} params.annualData - Dados anuais com metas por categoria.
 * @param {Array} params.categories - Lista de categorias.
 * @param {Array} params.types - Lista de tipos de transação (receita/despesa).
 * 
 * @returns {object} { performance, loading }
 */
export default function useMonthlyPerformanceData({
  yearMonth,
  annualData,
  categories,
  types,
}) {
  const { householdId } = useAppContext();

  const [performance, setPerformance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bloqueia execução se dados essenciais não estiverem prontos
    if (!householdId || !yearMonth || !annualData || !categories.length || !types.length) {
      setPerformance({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query transações do mês
    const transactionsRef = collection(db, `households/${householdId}/transactions`);
    const transactionsQuery = query(transactionsRef, where('yearMonth', '==', yearMonth));

    // Refere-se ao orçamento anual por categorias (não query, collection direta)
    const budgetsCollectionRef = collection(db, `households/${householdId}/budgets/${yearMonth.slice(0, 4)}/categories`);

    // Listener para transações do mês
    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (transactionsSnap) => {
        const realSpentByCategory = {};

        transactionsSnap.docs.forEach(doc => {
          const transaction = doc.data();
          const typeInfo = types.find(t => t.id === transaction.type_id);

          // Acumula valores apenas para despesas
          if (transaction.category_id && typeInfo && !typeInfo.isIncome) {
            realSpentByCategory[transaction.category_id] = (realSpentByCategory[transaction.category_id] || 0) + transaction.amount;
          }
        });

        // Listener para orçamentos do ano (categoria)
        const unsubscribeBudgets = onSnapshot(
          budgetsCollectionRef,
          (budgetsSnap) => {
            const budgetsMap = Object.fromEntries(
              budgetsSnap.docs.map(doc => {
                const data = doc.data();
                return [data.categoryId, { id: doc.id, ...data }];
              })
            );

            const newPerformance = {};

            categories.forEach(category => {
              const catId = category.id;
              const annualGoal = annualData[catId]?.goalAmount || 0;
              const monthlyBaseGoal = annualGoal / 12;

              const monthlyBudget = budgetsMap[catId];
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
                remaining: totalAvailable + realSpent, // gasto é negativo
                isOverBudget: -realSpent > totalAvailable,
                monthlyBudgetId: monthlyBudget?.id || null,
              };
            });

            setPerformance(newPerformance);
            setLoading(false);
          },
          (error) => {
            console.error('Erro ao carregar orçamentos anuais:', error);
            setLoading(false);
          }
        );

        // Cleanup do budget listener
        return () => unsubscribeBudgets();
      },
      (error) => {
        console.error('Erro ao carregar transações do mês:', error);
        setLoading(false);
      }
    );

    // Cleanup do transactions listener
    return () => unsubscribeTransactions();
  }, [householdId, yearMonth, annualData, categories, types]);

  return { performance, loading };
}
