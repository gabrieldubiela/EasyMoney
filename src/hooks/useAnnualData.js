// src/hooks/useAnnualData.js

import { useState, useEffect } from 'react';
import { useAppContext } from '../context/useAppContext';
import { fetchAllBudgets } from '../services/budgetService';
import { fetchAllTransactions } from '../services/transactionService';

/**
 * Hook responsável por consolidar dados anuais de orçamento e transações.
 *
 * - Busca budgets e transactions via serviços externos.
 * - Agrega todas as transações do ano (1º jan → 31 dez).
 * - Calcula receitas, despesas, saldo líquido e médias mensais.
 *
 * @param {string|number} selectedYear - Ano selecionado, ex: "2025".
 * @returns {object} { annualData, loading, error }
 */
export default function useAnnualData(selectedYear) {
  const { householdId } = useAppContext();
  const [annualData, setAnnualData] = useState({
    summary: {},
    performanceByCategories: {},
    rawAnnualData: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId || !selectedYear) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Busca budgets e transações do ano selecionado
        const [budgets, transactions] = await Promise.all([
          fetchAllBudgets(householdId, selectedYear),
          fetchAllTransactions(householdId, {
            startDate: new Date(`${selectedYear}-01-01`),
            endDate: new Date(`${selectedYear}-12-31`),
          }),
        ]);

        // 2. Estrutura inicial
        const dataMap = {};
        budgets.forEach((cat) => {
          dataMap[cat.id] = {
            budgeted: cat.totalBudget || 0,
            monthlyActuals: Array(12).fill(0),
          };
        });

        // 3. Soma transações de cada mês
        transactions.forEach((t) => {
          const monthIndex = parseInt(t.yearMonth.substring(4, 6), 10) - 1;
          if (!dataMap[t.category_id])
            dataMap[t.category_id] = { budgeted: 0, monthlyActuals: Array(12).fill(0) };
          dataMap[t.category_id].monthlyActuals[monthIndex] += t.amount;
        });

        // 4. Calcula somatórios YTD
        let totalRevenueYTD = 0;
        let totalExpenseYTD = 0;
        const currentYear = new Date().getFullYear();
        const monthsInPeriod =
          parseInt(selectedYear, 10) === currentYear
            ? new Date().getMonth() + 1
            : 12;

        const performance = Object.entries(dataMap).reduce((acc, [catId, entry]) => {
          const spentYTD = entry.monthlyActuals
            .slice(0, monthsInPeriod)
            .reduce((a, b) => a + b, 0);

          if (spentYTD > 0) totalRevenueYTD += spentYTD;
          else totalExpenseYTD += spentYTD;

          acc[catId] = {
            categoryId: catId,
            ...entry,
            spentYTD,
            annualBudget: entry.budgeted,
          };
          return acc;
        }, {});

        // 5. Define dados consolidados
        setAnnualData({
          summary: {
            totalRevenueYTD,
            totalExpenseYTD,
            netBalanceYTD: totalRevenueYTD + totalExpenseYTD,
            monthsInPeriod,
            avgMonthlySpent:
              monthsInPeriod > 0 ? Math.abs(totalExpenseYTD / monthsInPeriod) : 0,
          },
          performanceByCategories: performance,
          rawAnnualData: dataMap,
        });
      } catch (err) {
        console.error('Erro ao carregar dados anuais:', err);
        setError('Falha ao buscar dados anuais.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId, selectedYear]);

  return { annualData, loading, error };
}
