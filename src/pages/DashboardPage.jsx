// src/pages/DashboardPage.jsx

// src/pages/DashboardPage.jsx

import React, { useState } from "react";
import MonthlySummary from "../components/charts/MonthlySummary";
import CategorySummaryTable from "../components/charts/CategorySummaryTable";
import YearlyCategoryTable from "../components/charts/YearlyCategoryTable";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart";
import AlertList from "../components/charts/AlertList";
import RecentExpenses from "../components/charts/RecentExpenses";
import InvestmentProgress from "../components/charts/InvestmentProgress";
import useDashboardData from "../hooks/useDashboardData";

export default function DashboardPage() {
  const [metric, setMetric] = useState("all");

  const {
    isLoading,
    error,
    balance,
    categories,
    categorySummary,
    types,
    incomeData,
    expenseData,
    balanceData,
    recentTransactions,
    recentAlerts,
    investmentSummary,
  } = useDashboardData();

  // Dados Mensais para componente de Resumo
  const monthlySummary = {
    balance: balance?.netEffective || 0,
    totalIncome: balance?.incomeEffective || 0,
    totalExpense: balance?.expenseEffective || 0,
    projectedBalance:
      (balance?.netEffective || 0) +
      (balance?.incomePlanned || 0) +
      (balance?.expensePlanned || 0),
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">Carregando dados do dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        Ocorreu um erro ao carregar o dashboard.<br />
        <span>{String(error)}</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Filtro geral */}
      <MonthlySummary {...monthlySummary} />

      {/* Tabela do mês atual */}
      <CategorySummaryTable
        categories={categories}
        summary={categorySummary}
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
        summary={categorySummary}
      />

      {/* Alertas recentes */}
      <AlertList alerts={recentAlerts || []} />

      {/* Transações recentes */}
      <RecentExpenses
        transactions={recentTransactions || []}
        categories={categories}
        types={types}
      />


      {/* Investimentos e metas */}
      <InvestmentProgress
        totalPortfolio={investmentSummary?.totalPortfolio || 0}
        roi={investmentSummary?.roi || 0}
        goalStatus={Array.isArray(investmentSummary?.goalStatus) ? investmentSummary.goalStatus : []}
      />
    </div>
  );
}
