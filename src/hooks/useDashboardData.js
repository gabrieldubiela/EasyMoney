// src/hooks/useDashboardData.js

import { useMemo } from 'react';
import useHouseholdBaseData from './useHouseholdBaseData';
import useMonthlyPerformanceData from './useMonthlyPerformanceData';
import useBalance from './useBalance';
import useAnnualData from './useAnnualData';
import useMonthClosingStatus from './useMonthClosingStatus';

export default function useDashboardData() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const yearMonth = `${year}${String(month).padStart(2, '0')}`;

  // 1️⃣ Fonte unificada de dados base
  const {
    categories = [],
    types = [],
    transactions = [],
    plannedTransactions = [],
    alerts = [],
    budgets = {},
    goals = [],
    investments = [],
    investmentsHistory = [],
    loading: baseLoading,
    error: baseError,
  } = useHouseholdBaseData({
    includeAnnualData: true,
    includeMonthStatus: true,
  });

  // 2️⃣ Relatórios e cálculos derivados
  const { performance = {}, loading: performanceLoading } = useMonthlyPerformanceData({
    yearMonth,
    annualData: budgets,
    categories,
    types,
  });

  const { 
    incomeEffective = 0, 
    expenseEffective = 0, 
    netEffective = 0, 
    loading: balanceLoading 
  } = useBalance(year, month);

  const { annualData = {}, loading: annualLoading } = useAnnualData(year);
  const { monthStatus = {}, loading: closingLoading } = useMonthClosingStatus();

  // 3️⃣ Cálculos derivados e insights para exibição
  const criticalCategories = useMemo(() => {
    if (!performance || Object.keys(performance).length === 0) return [];

    return Object.values(performance)
      .filter(
        (item) =>
          item.isOverBudget ||
          (item.totalAvailable > 0 && item.remaining / item.totalAvailable < 0.2)
      )
      .sort((a, b) => Math.abs(a.remaining) - Math.abs(b.remaining))
      .slice(0, 5);
  }, [performance]);

  const recentTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    return transactions
      .filter(t => t.date) // ✅ Filtra transações com data
      .sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [transactions]);

  const recentAlerts = useMemo(() => {
    if (!alerts || !Array.isArray(alerts)) return [];
    
    return alerts
      .filter(a => a.createdAt) // ✅ Filtra alertas com data
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [alerts]);

  const investmentSummary = useMemo(() => {
    if (!investments || !Array.isArray(investments)) {
      return { totalInvestments: 0, gainPercent: 0 };
    }
    
    if (!goals || !Array.isArray(goals)) {
      return { totalInvestments: 0, gainPercent: 0 };
    }

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
    annualData: annualData || { summary: {}, performanceByCategories: {}, rawAnnualData: {} }, // ✅ Fallback
    performance,
    monthStatus,

    // Painel de destaques e avisos
    criticalCategories,
    recentTransactions,
    recentAlerts,

    // Resumo de metas e investimentos
    investmentSummary,
    goals: goals || [],

    // Controle global (UI)
    isLoading,
    error: baseError,
  };
}
