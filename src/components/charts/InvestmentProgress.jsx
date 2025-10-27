// src/components/charts/CategorySummaryTable.jsx

import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../../utils/formatCurrency";
import { getProgressWidthClass } from "../../utils/progressBarClass";
import "../../styles/cards.css";

/**
 * Painel de visão geral de investimentos e metas financeiras.
 * Mostra saldo aplicado, rentabilidade atual e andamento das metas.
 */
export default function InvestmentProgress({ totalPortfolio, roi, goalStatus }) {
  const formatValue = (value) => formatCurrency(value);

  return (
    <div className="card investment-progress">
      <h3 className="card-title">Investimentos</h3>
      <div className="investment-summary">
        <div className="investment-card summary-card">
          <span className="card-title">Carteira</span>
          <div className="card-value">{formatValue(totalPortfolio)}</div>
        </div>
        <div className="investment-card summary-card">
          <span className="card-title">Rendimento</span>
          <div className="card-value">
            {typeof roi === "number" ? roi.toFixed(2) : "0.00"}%
          </div>
        </div>
      </div>
      <div className="goal-section">
        <strong>Metas</strong>
        {goalStatus && goalStatus.length > 0 ? (
          <ul>
            {goalStatus.map((goal) => {
              const fillClass =
                goal.percent >= 100
                  ? "goal-progress-fill success"
                  : "goal-progress-fill primary";
              const widthClass = getProgressWidthClass(goal.percent);
              
              return (
                <li key={goal.goalId} className="goal-item">
                  <div className="goal-name">{goal.name}</div>
                  <div className="goal-progress-wrapper progress-bar-container">
                    <div className="goal-progress-bg progress-bar-bg">
                      <div className={`${fillClass} ${widthClass}`} />
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
          <div className="no-goals">Sem metas no momento</div>
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
