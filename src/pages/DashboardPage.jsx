// src/pages/DashboardPage.jsx

import React, { useState } from "react";
import MonthlySummary from "../components/charts/MonthlySummary";
import CategorySummaryTable from "../components/charts/CategorySummaryTable";
import YearlyCategoryTable from "../components/charts/YearlyCategoryTable";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart";
import DonutBudgetChart from "../components/charts/DonutBudgetChart";
import AlertList from "../components/charts/AlertList";
import RecentExpenses from "../components/charts/RecentExpenses";
import InvestmentProgress from "../components/charts/InvestmentProgress";
import useDashboardData from "../hooks/useDashboardData";

/**
 * Página principal do Dashboard conectada aos dados reais via hooks.
 */
export default function DashboardPage() {
  // Filtros interativos
  const [typeFilter, setTypeFilter] = useState(null); // "fixed", "variable" ou null (todas)
  const [metric, setMetric] = useState("balance"); // "balance" | "income" | "expense"

  // Dados reais do dashboard
  const {
    isLoading,
    error,
    balance,
    annualData,
    recentTransactions,
    recentAlerts,
    investmentSummary,
  } = useDashboardData();

  // Dados derivados para resumo mensal
  const monthlySummary = {
    balance: balance?.netEffective || 0,
    totalIncome: balance?.incomeEffective || 0,
    totalExpense: balance?.expenseEffective || 0,
    projectedBalance: (balance?.netEffective || 0) + (balance?.incomePlanned || 0) + (balance?.expensePlanned || 0)
  };

  // Categories e summary para tabelas/gráficos
  const categories = annualData?.performanceByCategories
    ? Object.values(annualData.performanceByCategories).map(cat => ({
        id: cat.categoryId,
        name: cat.categoryName,
        typeId: cat.typeId || null
      }))
    : [];
  const budgetSummary = annualData?.performanceByCategories || {};

  // Dados mensais para gráfico de tendência (12 meses)
  const incomeData = categories.length > 0
    ? categories.map(cat => (cat.monthlyActuals || []).map((v, i) => v > 0 ? v : 0)).reduce((acc, curr) => {
        curr.forEach((v, i) => acc[i] = (acc[i] || 0) + v);
        return acc;
      }, Array(12).fill(0))
    : Array(12).fill(0);
  const expenseData = categories.length > 0
    ? categories.map(cat => (cat.monthlyActuals || []).map((v, i) => v < 0 ? v : 0)).reduce((acc, curr) => {
        curr.forEach((v, i) => acc[i] = (acc[i] || 0) + v);
        return acc;
      }, Array(12).fill(0))
    : Array(12).fill(0);
  const balanceData = incomeData.map((inc, i) => inc + (expenseData[i] || 0));

  // Dados de investimentos/metas
  // investmentSummary: { totalPortfolio, roi, goalStatus }

  if (isLoading) {
    return (
      <div className="dashboard-page">
        Carregando dados do dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        Ocorreu um erro ao carregar o dashboard.<br/>
        <span>{String(error)}</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <MonthlySummary {...monthlySummary}/>

      {/* Filtro por tipo */}
      <div>
        <label>Category type: </label>
        <select
          value={typeFilter || ""}
          onChange={e => setTypeFilter(e.target.value || null)}
        >
          <option value="">All</option>
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      {/* Tabela do mês atual */}
      <CategorySummaryTable
        categories={categories}
        summary={budgetSummary}
        typeFilter={typeFilter}
    />

      {/* Gráfico linha evolução */}
      <MonthlyTrendChart
        incomeData={incomeData}
        expenseData={expenseData}
        balanceData={balanceData}
        metric={metric}
        onChangeMetric={setMetric}
    />

      {/* Tabela anual por categoria */}
      <YearlyCategoryTable
        categories={categories}
        summary={budgetSummary}
        typeFilter={typeFilter}
    />

      {/* Donut pizza orçamento */}
      <DonutBudgetChart
        categories={categories}
        summary={budgetSummary}
        typeFilter={typeFilter}
        maxCategories={5}
    />

      {/* Alertas recentes */}
      <AlertList alerts={recentAlerts}/>

      {/* Transações recentes */}
      <RecentExpenses transactions={recentTransactions} maxItems={10}/>

      {/* Investimentos e metas */}
      <InvestmentProgress
        totalPortfolio={investmentSummary.totalPortfolio}
        roi={investmentSummary.roi}
        goalStatus={investmentSummary.goalStatus}
    />
    </div>
  );
}
