// src/hooks/useAnnualData.js

import { useState, useEffect } from 'react';
import { useAppContext } from '../context/useAppContext';
import { fetchAllBudgets } from '../services/budgetService';
import { fetchAllTransactions } from '../services/transactionService';

/**
 * Estrutura padrão de dados para inicialização de categorias.
 * Contém o orçamento e os totais mensais.
 */
const INITIAL_CATEGORY_DATA = {
  budgeted: 0,
  monthlyActuals: Array(12).fill(0),
};

/**
 * Hook responsável por consolidar os dados anuais de orçamento e transações,
 * calculando métricas como total de receitas, despesas e desempenho mensal.
 *
 * @param {string|number} selectedYear - Ano selecionado para análise (ex: '2025').
 * @returns {object} Retorna dados consolidados, status de carregamento e erros.
 */
const useAnnualData = (selectedYear) => {
  const { householdId } = useAppContext();
  const [annualData, setAnnualData] = useState({
    summary: {},
    performanceByCategories: {},
    rawAnnualData: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Garante que só executa se existir householdId e ano válido
    if (!householdId || !selectedYear) return;

    /**
     * Busca dados de orçamento e transações e realiza a consolidação.
     */
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Busca dados dos budgets e transactions via services
        const budgets = await fetchAllBudgets(householdId, selectedYear);
        const transactions = await fetchAllTransactions(householdId, {
          startDate: new Date(`${selectedYear}-01-01`),
          endDate: new Date(`${selectedYear}-12-31`),
        });

        // 2. Monta estrutura base dos dados de orçamento
        const budgetsMap = {};
        budgets.forEach((cat) => {
          budgetsMap[cat.id] = {
            ...INITIAL_CATEGORY_DATA,
            budgeted: cat.totalBudget || 0,
            docId: cat.id,
          };
        });

        // 3. Integra transações mensais ao mapa de categorias
        transactions.forEach((t) => {
          const { category_id, amount, yearMonth } = t;
          const monthIndex = parseInt(yearMonth.substring(4, 6), 10) - 1;
          if (!budgetsMap[category_id])
            budgetsMap[category_id] = { ...INITIAL_CATEGORY_DATA, docId: null };

          budgetsMap[category_id].monthlyActuals[monthIndex] += amount;
        });

        // 4. Calcula métricas anuais (YTD)
        const currentYear = new Date().getFullYear();
        const monthsInPeriod =
          currentYear === parseInt(selectedYear, 10)
            ? new Date().getMonth() + 1
            : 12;

        let totalRevenueYTD = 0;
        let totalExpenseYTD = 0;

        const performance = Object.entries(budgetsMap).reduce(
          (acc, [catId, data]) => {
            const spentYTD = data.monthlyActuals
              .slice(0, monthsInPeriod)
              .reduce((a, b) => a + b, 0);

            if (spentYTD > 0) totalRevenueYTD += spentYTD;
            else totalExpenseYTD += spentYTD;

            acc[catId] = {
              categoryId: catId,
              ...data,
              spentYTD,
              annualBudget: data.budgeted,
            };

            return acc;
          },
          {}
        );

        // 5. Define estrutura final dos dados anuais
        setAnnualData({
          summary: {
            totalRevenueYTD,
            totalExpenseYTD,
            netBalanceYTD: totalRevenueYTD + totalExpenseYTD,
            monthsInPeriod,
            avgMonthlySpent:
              monthsInPeriod > 0
                ? Math.abs(totalExpenseYTD / monthsInPeriod)
                : 0,
          },
          performanceByCategories: performance,
          rawAnnualData: budgetsMap,
        });
      } catch (err) {
        console.error('Erro ao buscar dados anuais:', err);
        setError('Falha ao carregar dados anuais.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [householdId, selectedYear]);

  return { annualData, loading, error };
};

export default useAnnualData;
