import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/useAppContext';
import { fetchAllBudgets, updateBudgetCategoryTypeValue } from '../services/budgetService';
import { fetchAllTransactions } from '../services/transactionService';

/**
 * Hook customizado para carregar e editar orçamento anual detalhado.
 * @param {string|number} selectedYear
 * @returns {object}
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

  // Chave para forçar reload pós update
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!householdId || !selectedYear) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [budgets, transactions] = await Promise.all([
          fetchAllBudgets(householdId, selectedYear),
          fetchAllTransactions(householdId, {
            startDate: new Date(`${selectedYear}-01-01`),
            endDate: new Date(`${selectedYear}-12-31`)
          }),
        ]);

        const dataMap = {};
        budgets.forEach((cat) => {
          dataMap[cat.id] = {
            ...cat,
            budgeted: cat.totalBudget || 0,
            monthlyActuals: Array(12).fill(0),
            types: cat.types || {},
          };
        });

        transactions.forEach((t) => {
          const monthIndex = parseInt(t.yearMonth.substring(4, 6), 10) - 1;
          if (!dataMap[t.category_id])
            dataMap[t.category_id] = { budgeted: 0, monthlyActuals: Array(12).fill(0), types: {} };
          dataMap[t.category_id].monthlyActuals[monthIndex] += t.amount;
        });

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
      } catch {
        setError('Falha ao buscar dados anuais.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId, selectedYear, refreshKey]);

  /**
   * Atualiza o valor orçado no banco. NÃO mais recarrega os dados aqui.
   * @param {string} categoryId
   * @param {string} typeId
   * @param {number} value
   */
  const updateAnnualGoal = async (categoryId, typeId, value) => {
    if (!householdId || !selectedYear) return;
    await updateBudgetCategoryTypeValue(householdId, selectedYear, categoryId, typeId, value);
    // Não chama setRefreshKey aqui!
  };

  /**
   * Força reload dos dados vindos do banco de dados
   */
  const refreshAnnualData = () => setRefreshKey(k => k + 1);

  const stableAnnualData = useMemo(() => annualData, [annualData]);

  return { annualData: stableAnnualData, loading, error, updateAnnualGoal, refreshAnnualData };
}
