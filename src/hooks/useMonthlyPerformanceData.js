// src/hooks/useMonthlyPerformanceData.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook responsável por consolidar dados de performance orçamentária mensal.
 * 
 * - Escuta mudanças em tempo real de `transactions` e `monthlyBudgets`.
 * - Calcula o desempenho de gastos por categoria.
 * - Retorna estrutura consolidada com status de carregamento.
 *
 * Observação:
 *   As medições usam o padrão esperado:
 *   - `category_id`: categoria vinculada à transação
 *   - `type.isIncome`: define receitas (ignora no cálculo de despesas)
 *
 * @param {object} params 
 * @param {string} params.yearMonth - Mês no formato YYYYMM.
 * @param {object} params.annualData - Dados anuais (com metas).
 * @param {Array<object>} params.categories - Lista de categorias.
 * @param {Array<object>} params.types - Lista de tipos de transações.
 * @returns {object} { performance, loading }
 */
export default function useMonthlyPerformanceData({
  yearMonth,
  annualData,
  categories,
  types
}) {
  const { householdId } = useAppContext();
  const [performance, setPerformance] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bloqueia execução enquanto dependências essenciais não estão prontas
    if (
      !householdId ||
      !yearMonth ||
      !annualData ||
      categories.length === 0 ||
      types.length === 0
    ) {
      setPerformance({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Queries Firestore
    const transactionsRef = collection(db, `households/${householdId}/transactions`);
    const monthlyBudgetsRef = collection(db, `households/${householdId}/monthlyBudgets`);

    const transactionsQuery = query(transactionsRef, where('yearMonth', '==', yearMonth));
    const budgetsQuery = query(monthlyBudgetsRef, where('yearMonth', '==', yearMonth));

    // Listener principal de transações
    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (transactionsSnap) => {
        const realSpentByCategory = {};

        transactionsSnap.docs.forEach((doc) => {
          const transaction = doc.data();
          const typeInfo = types.find((t) => t.id === transaction.type_id);

          // Acumula valores apenas de despesas
          if (transaction.category_id && typeInfo && !typeInfo.isIncome) {
            realSpentByCategory[transaction.category_id] =
              (realSpentByCategory[transaction.category_id] || 0) + transaction.amount;
          }
        });

        // Listener dos orçamentos mensais
        const unsubscribeBudgets = onSnapshot(
          budgetsQuery,
          (budgetsSnap) => {
            const budgetsMap = Object.fromEntries(
              budgetsSnap.docs.map((doc) => [
                doc.data().categoryId,
                { id: doc.id, ...doc.data() }
              ])
            );

            const newPerformance = {};

            categories.forEach((category) => {
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
                remaining: totalAvailable + realSpent, // realSpent é negativo
                isOverBudget: -realSpent > totalAvailable,
                monthlyBudgetId: monthlyBudget?.id || null,
              };
            });

            setPerformance(newPerformance);
            setLoading(false);
          },
          (err) => {
            console.error('Erro ao carregar budgets mensais:', err);
            setLoading(false);
          }
        );

        // Cleanup do listener de budgets
        return () => unsubscribeBudgets();
      },
      (err) => {
        console.error('Erro ao carregar transações do mês:', err);
        setLoading(false);
      }
    );

    // Cleanup principal (transactions + budgets)
    return () => unsubscribeTransactions();
  }, [householdId, yearMonth, annualData, categories, types]);

  return { performance, loading };
}
