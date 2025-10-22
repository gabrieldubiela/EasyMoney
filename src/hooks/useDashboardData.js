// src/hooks/useDashboardData.js

import { useMemo } from 'react';
import useHouseholdBaseData from './useHouseholdBaseData';
import useMonthlyPerformanceData from './useMonthlyPerformanceData';
import useBalance from './useBalance';
import useAnnualData from './useAnnualData';
import useMonthClosingStatus from './useMonthClosingStatus';

/**
 * Hook agregador e analítico para o Dashboard principal.
 * 
 * - Combina múltiplos hooks de dados (via useHouseholdBaseData)
 * - Deriva métricas simplificadas para exibição (saldo, alertas, metas, investimentos)
 * - Calcula indicadores de desempenho mensal e anual
 */
export default function useDashboardData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const yearMonth = `${year}${String(month).padStart(2, '0')}`;

  // 1️⃣ Fonte unificada de dados base
  const {
    categories,
    types,
    transactions,
    plannedTransactions,
    alerts,
    budgets,
    goals,
    investments,
    investmentsHistory,
    loading: baseLoading,
    error: baseError,
  } = useHouseholdBaseData({
    includeAnnualData: true,
    includeMonthStatus: true,
  });

  // 2️⃣ Relatórios e cálculos derivados
  const { performance, loading: performanceLoading } = useMonthlyPerformanceData({
    yearMonth,
    annualData: budgets, // or budgets from AnnualData if needed
    categories,
    types,
  });

  const { incomeEffective, expenseEffective, netEffective, loading: balanceLoading } = useBalance(
    year,
    month
  );

  const { annualData, loading: annualLoading } = useAnnualData(year);
  const { monthStatus, loading: closingLoading } = useMonthClosingStatus();

  // 3️⃣ Cálculos derivados e insights para exibição (Memo para performance)
  const criticalCategories = useMemo(() => {
    if (!performance || Object.keys(performance).length === 0) return [];

    return Object.values(performance)
      .filter(
        (item) =>
          item.isOverBudget ||
          (item.totalAvailable > 0 && item.remaining / item.totalAvailable < 0.2)
      )
      .sort((a, b) => Math.abs(a.remaining) - Math.abs(b.remaining))
      .slice(0, 5); // top 5 categorias mais críticas
  }, [performance]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => b.date?.toDate() - a.date?.toDate())
      .slice(0, 6);
  }, [transactions]);

  const recentAlerts = useMemo(() => {
    return alerts
      .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())
      .slice(0, 5);
  }, [alerts]);

  const investmentSummary = useMemo(() => {
    const totalInvestments = investments.reduce(
      (sum, i) => sum + (i.currentValue || 0),
      0
    );
    const goalInvestments = goals
      .filter((g) => g.type === 'investment')
      .reduce((sum, g) => sum + (g.targetValue || 0), 0);
    const gainPercent =
      goalInvestments > 0
        ? ((totalInvestments - goalInvestments) / goalInvestments) * 100
        : 0;

    return { totalInvestments, gainPercent };
  }, [investments, goals]);

  // 4️⃣ Indicadores e estados de carregamento
  const isLoading =
    baseLoading ||
    performanceLoading ||
    balanceLoading ||
    annualLoading ||
    closingLoading;

  return {
    // Principais blocos de dados
    balance: {
      incomeEffective,
      expenseEffective,
      netEffective,
    },
    annualData,
    performance,
    monthStatus,

    // Painel de destaques e avisos
    criticalCategories,
    recentTransactions,
    recentAlerts,

    // Resumo de metas e investimentos
    investmentSummary,
    goals,

    // Controle global (UI)
    isLoading,
    error: baseError,
  };
}
