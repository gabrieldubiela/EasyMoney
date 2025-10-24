// src/components/charts/CategorySummaryTable.jsx

import React from "react";
import PropTypes from "prop-types";
// Importa tudo o que precisa para resumo/card, progress bar e layout geral
import "../../styles/cards.css";
import "../../styles/progress-bars.css";

/**
 * Painel de visão geral de investimentos e metas financeiras.
 * Mostra saldo aplicado, rentabilidade atual e andamento das metas.
 */
export default function InvestmentProgress({ totalPortfolio, roi, goalStatus }) {
  const formatValue = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  return (
    <div className="card investment-progress">
      <strong className="card-title">Investments & Goals</strong>
      <div className="investment-summary">
        <div className="investment-card summary-card">
          <span className="card-title">Portfolio</span>
          <div className="card-value">{formatValue(totalPortfolio)}</div>
        </div>
        <div className="investment-card summary-card">
          <span className="card-title">ROI</span>
          <div className="card-value">
            {typeof roi === "number" ? roi.toFixed(2) : "0.00"}%
          </div>
        </div>
      </div>
      <div className="goal-section">
        <strong>Goal Progress:</strong>
        {goalStatus && goalStatus.length > 0 ? (
          <ul >
            {goalStatus.map((goal) => {
              const fillClass =
                goal.percent >= 100
                  ? "goal-progress-fill success"
                  : "goal-progress-fill primary";
              return (
                <li key={goal.goalId} className="goal-item">
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-progress-wrapper progress-bar-container">
                    <div className="goal-progress-bg progress-bar-bg">
                      <div
                        className={fillClass}
                        style={{
                          width: `${Math.min(goal.percent, 100)}%`,
                        }}
                      />
                    </div>
                    <span>{goal.percent}%</span>
                    <span className="goal-meta">
                      ({formatValue(goal.achieved)} atingido)
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="no-goals">No active goals.</div>
        )}
      </div>
    </div>
  );
}

InvestmentProgress.propTypes = {
  totalPortfolio: PropTypes.number.isRequired,
  roi: PropTypes.number.isRequired,
  goalStatus: PropTypes.arrayOf(
    PropTypes.shape({
      goalId: PropTypes.string.isRequired,
      name: PropTypes.string,
      percent: PropTypes.number,
      achieved: PropTypes.number,
    })
  ).isRequired,
};
