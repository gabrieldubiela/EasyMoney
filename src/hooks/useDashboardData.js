// src/hooks/useDashboardData.js

import { useMemo } from 'react';
import useHouseholdBaseData from './useHouseholdBaseData';
import useMonthlyPerformanceData from './useMonthlyPerformanceData';
import useBalance from './useBalance';
import useAnnualData from './useAnnualData';
import useMonthClosingStatus from './useMonthClosingStatus';
import useInvestmentInsights from './useInvestmentInsights';

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
  } = useHouseholdBaseData();

  // 2️⃣ Dados anuais (como na BudgetSheet)
  const { annualData = {}, loading: annualLoading } = useAnnualData(year);

  // 3️⃣ Relatórios e cálculos derivados
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

  const { monthStatus = {}, loading: closingLoading } = useMonthClosingStatus();

  // Montar categorias com dados agregados (como BudgetSheet)
  const categoriesWithData = useMemo(() => {
    if (!annualData.rawAnnualData || categories.length === 0) return [];
    
    return categories.map((cat) => {
      const budgetCat = annualData.rawAnnualData[cat.id] || {};
      return {
        id: cat.id,
        name: cat.name,
        monthlyActuals: budgetCat.monthlyActuals || Array(12).fill(0),
        budgeted: budgetCat.types
          ? Object.values(budgetCat.types).reduce((a, t) => a + (t.valor || 0), 0)
          : 0,
      };
    });
  }, [annualData.rawAnnualData, categories]);

  // Montar resumo por categoria para tabela
  const categorySummary = useMemo(() => {
    const summary = {};
    const monthIdx = new Date().getMonth();
    
    categoriesWithData.forEach(cat => {
      const monthlyActual = cat.monthlyActuals[monthIdx] || 0;
      const planned = cat.budgeted / 12; // simplificado - pode usar valor mensal específico
      const percent = planned > 0 ? Math.round((Math.abs(monthlyActual) / planned) * 100) : 0;
      
      summary[cat.id] = {
        months: Array(12).fill(0).map((_, idx) => ({
          planned: planned,
          spent: Math.abs(cat.monthlyActuals[idx] || 0),
          percent: planned > 0 ? Math.round((Math.abs(cat.monthlyActuals[idx] || 0) / planned) * 100) : 0,
        }))
      };
    });
    
    return summary;
  }, [categoriesWithData]);

  // Cálculo por tipo: totais mês a mês e total no ano
const typesWithData = useMemo(() => {
  if (!types.length || !transactions.length) return [];
  // array de 12 meses (index 0 = janeiro)
  const month = today.getMonth();

  return types.map(type => {
    // todos lançamentos do tipo, realizados
    const filtered = transactions.filter(tx => tx.type_id === type.id);
    // gastos por mês
    const monthlyTotals = Array(12).fill(0);
    filtered.forEach(tx => {
      const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
      if (!isNaN(txDate.getTime())) {
        monthlyTotals[txDate.getMonth()] += tx.amount;
      }
    });
    // total anual
    const totalYear = monthlyTotals.reduce((a, b) => a + b, 0);
    // gasto no mês atual
    const totalThisMonth = monthlyTotals[month];
    return {
      ...type,
      monthlyTotals,
      totalThisMonth,
      totalYear,
    };
  });
}, [types, transactions, today]);


  // Arrays para gráfico de evolução mensal
  const { incomeData, expenseData, balanceData } = useMemo(() => {
    if (categoriesWithData.length === 0) {
      return {
        incomeData: Array(12).fill(0),
        expenseData: Array(12).fill(0),
        balanceData: Array(12).fill(0),
      };
    }

    const income = Array(12).fill(0);
    const expense = Array(12).fill(0);

    categoriesWithData.forEach(cat => {
      cat.monthlyActuals.forEach((value, monthIdx) => {
        if (value > 0) {
          income[monthIdx] += value;
        } else {
          expense[monthIdx] += value;
        }
      });
    });

    const balance = income.map((inc, idx) => inc + expense[idx]);

    return { incomeData: income, expenseData: expense, balanceData: balance };
  }, [categoriesWithData]);

  // 4️⃣ Investimentos (usando o hook insights existente)
  const investmentSummary = useInvestmentInsights(investments, goals);

  // 5️⃣ Outros cálculos derivados
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
    .filter(t => t.date && (!t.installments_current || t.installments_current === 1))
    .sort((a, b) => {
      const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return dateB - dateA;
    })
    .slice(0, 5);
}, [transactions]);


  const recentAlerts = useMemo(() => {
    if (!alerts || !Array.isArray(alerts)) return [];

    return alerts
      .filter(a => a.createdAt)
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [alerts]);

  // 6️⃣ Loading
  const isLoading =
    baseLoading ||
    performanceLoading ||
    balanceLoading ||
    annualLoading ||
    closingLoading;

  return {
    // ✅ DADOS CORRIGIDOS
    categories: categoriesWithData, // array simples de categorias com dados
    types: typesWithData, // array simples de tipos com dados
    categorySummary, // objeto para tabela resumo
    incomeData, // array para gráfico
    expenseData, // array para gráfico  
    balanceData, // array para gráfico

    // Principais blocos de dados
    balance: {
      incomeEffective,
      expenseEffective,
      netEffective,
    },
    annualData: annualData || { summary: {}, performanceByCategories: {}, rawAnnualData: {} },
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
