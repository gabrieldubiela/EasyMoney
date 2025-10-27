// src/pages/InvestimentsPage.jsx

import React, { useState } from 'react';
import useAllGoals from '../hooks/useAllGoals';
import useAllInvestments from '../hooks/useAllInvestments';
import useAllGoalAllocations from '../hooks/useAllGoalAllocations';
import useInvestmentInsights from '../hooks/useInvestmentInsights';
import InvestmentForm from '../components/forms/InvestmentForm';
import GoalForm from '../components/forms/GoalForm';
import GoalAllocationForm from '../components/forms/GoalAllocationForm';
import formatCurrency from '../utils/formatCurrency';
import formatDate from '../utils/formatDate';

const InvestmentsPage = () => {
  // Dados principais
  const { goals, loading: loadingGoals } = useAllGoals();
  const { investments, loading: loadingInvestments } = useAllInvestments();
  const { allocations, loading: loadingAllocations } = useAllGoalAllocations();
  const { totalPortfolio, roi, goalStatus } = useInvestmentInsights(investments, goals);

  // States para modais (Adicionar/Edição)
  const [activeInvestment, setActiveInvestment] = useState(null);
  const [activeGoal, setActiveGoal] = useState(null);
  const [showAllocationForm, setShowAllocationForm] = useState(false);

  return (
    <div className="container">
      <h1 className="page-title">Gestão de Investimentos e Metas Financeiras</h1>

      <section className="card">
        <h2>Visão Geral da Carteira</h2>
        <div>
          <strong>Total Investido:</strong> {formatCurrency(totalPortfolio)}
        </div>
        <div>
          <strong>Rentabilidade (ROI):</strong> {roi.toFixed(2)}%
        </div>
      </section>

      <section className="card">
        <h2>Investimentos</h2>
        <button onClick={() => setActiveInvestment({})}>+ Novo Investimento</button>
        {loadingInvestments ? (
          <div>Carregando investimentos...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor Inicial</th>
                <th>Valor Atual</th>
                <th>Rentabilidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(investment => {
                const percent = investment.initialAmount > 0
                  ? ((investment.currentAmount - investment.initialAmount) / investment.initialAmount) * 100
                  : 0;
                return (
                  <tr key={investment.id}>
                    <td>{investment.name}</td>
                    <td>{formatCurrency(investment.initialAmount)}</td>
                    <td>{formatCurrency(investment.currentAmount)}</td>
                    <td>{percent.toFixed(2)}%</td>
                    <td>
                      <button onClick={() => setActiveInvestment(investment)}>Editar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {/* Modal/Form */}
        {activeInvestment !== null && (
          <InvestmentForm
            investment={activeInvestment.id ? activeInvestment : null}
            onSuccess={() => setActiveInvestment(null)}
            onCancel={() => setActiveInvestment(null)}
          />
        )}
      </section>

      <section className="card">
        <h2>Metas Financeiras</h2>
        <button onClick={() => setActiveGoal({})}>+ Nova Meta</button>
        {loadingGoals ? (
          <div>Carregando metas...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Meta</th>
                <th>Total Alocado</th>
                <th>% Atingido</th>
                <th>Data Física</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {goals.map(goal => {
                const insight = goalStatus.find(g => g.goalId === goal.id) || {};
                return (
                  <tr key={goal.id}>
                    <td>{goal.name}</td>
                    <td>{formatCurrency(goal.targetAmount)}</td>
                    <td>{formatCurrency(insight.achieved)}</td>
                    <td>{insight.percent || 0}%</td>
                    <td>{goal.targetDate ? formatDate(goal.targetDate) : '-'}</td>
                    <td>{goal.status}</td>
                    <td>
                      <button onClick={() => setActiveGoal(goal)}>Editar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {/* Modal/Form */}
        {activeGoal !== null && (
          <GoalForm
            goal={activeGoal.id ? activeGoal : null}
            onSuccess={() => setActiveGoal(null)}
            onCancel={() => setActiveGoal(null)}
          />
        )}
      </section>

      <section className="card">
        <h2>Alocar Investimentos para Metas</h2>
        <button onClick={() => setShowAllocationForm(true)}>+ Nova Alocação</button>
        {loadingAllocations ? (
          <div>Carregando alocações...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Meta</th>
                <th>Investimento</th>
                <th>Percentual (%)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map(a => {
                const investmentName = investments.find(i => i.id === a.investmentId)?.name || '-';
                const goalName = goals.find(g => g.id === a.goalId)?.name || '-';
                return (
                  <tr key={a.id}>
                    <td>{goalName}</td>
                    <td>{investmentName}</td>
                    <td>{a.percentage}%</td>
                    <td>
                      {/* Botões de editar/excluir */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {showAllocationForm && (
          <GoalAllocationForm
            investments={investments}
            goals={goals}
            onSuccess={() => setShowAllocationForm(false)}
            onCancel={() => setShowAllocationForm(false)}
          />
        )}
      </section>
    </div>
  );
};

export default InvestmentsPage;
