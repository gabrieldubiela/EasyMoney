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

export default function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState(null);
  const [metric, setMetric] = useState("balance");

  const {
    isLoading,
    error,
    balance,
    annualData,
    recentTransactions,
    recentAlerts,
    investmentSummary,
  } = useDashboardData();

  // ✅ Dados derivados para resumo mensal
  const monthlySummary = {
    balance: balance?.netEffective || 0,
    totalIncome: balance?.incomeEffective || 0,
    totalExpense: balance?.expenseEffective || 0,
    projectedBalance: (balance?.netEffective || 0) + (balance?.incomePlanned || 0) + (balance?.expensePlanned || 0)
  };

  // ✅ CORREÇÃO: Adicione verificação e fallback
  const categories = annualData?.performanceByCategories
    ? Object.values(annualData.performanceByCategories).map(cat => ({
        id: cat.categoryId,
        name: cat.categoryName,
        typeId: cat.typeId || null
      }))
    : [];
  
  const budgetSummary = annualData?.performanceByCategories || {};

  // ✅ CORREÇÃO: Dados mensais com verificação
  const incomeData = categories.length > 0
    ? categories
        .map(cat => (cat.monthlyActuals || []).map((v, i) => v > 0 ? v : 0))
        .reduce((acc, curr) => {
          curr.forEach((v, i) => acc[i] = (acc[i] || 0) + v);
          return acc;
        }, Array(12).fill(0))
    : Array(12).fill(0);

  const expenseData = categories.length > 0
    ? categories
        .map(cat => (cat.monthlyActuals || []).map((v, i) => v < 0 ? v : 0))
        .reduce((acc, curr) => {
          curr.forEach((v, i) => acc[i] = (acc[i] || 0) + v);
          return acc;
        }, Array(12).fill(0))
    : Array(12).fill(0);

  const balanceData = incomeData.map((inc, i) => inc + (expenseData[i] || 0));

  if (isLoading) {
    return (
      <div className="dashboard-page" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Carregando dados do dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page" style={{ padding: '20px' }}>
        Ocorreu um erro ao carregar o dashboard.<br/>
        <span style={{ color: 'red' }}>{String(error)}</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <MonthlySummary {...monthlySummary}/>

      {/* Filtro por tipo */}
      <div style={{ margin: '20px 0' }}>
        <label>Tipo de categoria: </label>
        <select
          value={typeFilter || ""}
          onChange={e => setTypeFilter(e.target.value || null)}
        >
          <option value="">Todas</option>
          <option value="fixed">Fixas</option>
          <option value="variable">Variáveis</option>
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
      <AlertList alerts={recentAlerts || []}/>

      {/* Transações recentes */}
      <RecentExpenses transactions={recentTransactions || []} maxItems={10}/>

      {/* Investimentos e metas */}
      <InvestmentProgress
        totalPortfolio={investmentSummary?.totalPortfolio || 0}
        roi={investmentSummary?.roi || 0}
        goalStatus={investmentSummary?.goalStatus || 'on_track'}
      />
    </div>
  );
}
