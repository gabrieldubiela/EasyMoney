import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/useAppContext';
import { fetchAllBudgets } from '../services/budgetService';
import { fetchAllTransactions } from '../services/transactionService';

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
        const [budgets, transactions] = await Promise.all([
          fetchAllBudgets(householdId, selectedYear),
          fetchAllTransactions(householdId, {
            startDate: new Date(`${selectedYear}-01-01`),
            endDate: new Date(`${selectedYear}-12-31`),
          }),
        ]);

        const dataMap = {};
        budgets.forEach((cat) => {
          dataMap[cat.id] = {
            budgeted: cat.totalBudget || 0,
            monthlyActuals: Array(12).fill(0),
          };
        });

        transactions.forEach((t) => {
          const monthIndex = parseInt(t.yearMonth.substring(4, 6), 10) - 1;
          if (!dataMap[t.category_id])
            dataMap[t.category_id] = { budgeted: 0, monthlyActuals: Array(12).fill(0) };
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
      } catch (err) {
        console.error('Erro ao carregar dados anuais:', err);
        setError('Falha ao buscar dados anuais.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId, selectedYear]);

  // ✅ Estabiliza com JSON.stringify (melhor para objetos complexos)
  const stableAnnualData = useMemo(
    () => annualData,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(annualData)]
  );

  return { annualData: stableAnnualData, loading, error };
}
