// src/components/charts/InvestmentProgress.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Painel de visão geral de investimentos e metas financeiras.
 * Mostra saldo aplicado, rentabilidade atual, progresso das metas.
 *
 * @prop {number} totalPortfolio - Valor investido atual
 * @prop {number} roi - Rentabilidade acumulada (%)
 * @prop {Array} goalStatus - [{ goalId, name, percent, achieved }]
 */
export default function InvestmentProgress({ totalPortfolio, roi, goalStatus }) {
  const formatValue = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    });

  return (
    <div className="investment-progress" style={{ marginTop: "2em", maxWidth: 500 }}>
      <strong style={{ fontSize: 16, marginBottom: 12, display: "block" }}>
        Investments & Goals
      </strong>
      <div style={{ display: "flex", gap: "2em", marginBottom: 18 }}>
        <div style={{ background: "#e6f7ee", padding: "1em 2em", borderRadius: 8 }}>
          <span style={{ color: "#187488", fontWeight: "bold" }}>Portfolio</span>
          <div style={{ fontSize: 20 }}>{formatValue(totalPortfolio)}</div>
        </div>
        <div style={{ background: "#f3fff3", padding: "1em 2em", borderRadius: 8 }}>
          <span style={{ color: "#228a1c", fontWeight: "bold" }}>ROI</span>
          <div style={{ fontSize: 20 }}>
            {typeof roi === "number" ? roi.toFixed(2) : "0.00"}%
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong style={{ fontSize: 14, marginBottom: 6, display: "block" }}>
          Goal progress:
        </strong>
        {goalStatus && goalStatus.length > 0 ? (
          <ul style={{ paddingLeft: 0, margin: 0, listStyle: "none" }}>
            {goalStatus.map(goal => (
              <li key={goal.goalId} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: "bold", color: "#143b6d", marginBottom: 2 }}>
                  {goal.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: "140px",
                      height: "14px",
                      borderRadius: 8,
                      background: "#e1e6f8",
                      overflow: "hidden",
                      marginRight: 8
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(goal.percent, 100)}%`,
                        background: goal.percent >= 100 ? "#40ba4f" : "#418fd1"
                      }}
                    />
                  </div>
                  <span>{goal.percent}%</span>
                  <span style={{ fontSize: 13, marginLeft: 8, color: "#555" }}>
                    ({formatValue(goal.achieved)} atingido)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: "#999" }}>No active goals.</div>
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
      achieved: PropTypes.number
    })
  ).isRequired
};
