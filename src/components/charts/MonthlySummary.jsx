// src/components/charts/CategorySummaryTable.jsx

import React from "react";
import PropTypes from "prop-types";
import "../../styles/cards.css";

/**
 * Resumo financeiro do mês atual, com saldo, entradas, saídas e projeção.
 */
export default function MonthlySummary({
  balance,
  totalIncome,
  totalExpense,
  projectedBalance,
}) {
  const formatValue = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  return (
    <div className="summary-container monthly-summary-container">
      <div className="card summary-card monthly-summary-card balance">
        <h3 className="card-title">Saldo do mês</h3>
        <span className="card-value">{formatValue(balance)}</span>
      </div>

      <div className="card summary-card monthly-summary-card income">
        <h3 className="card-title">Entradas</h3>
        <span className="card-value">{formatValue(totalIncome)}</span>
      </div>

      <div className="card summary-card monthly-summary-card expense">
        <h3 className="card-title">Saídas</h3>
        <span className="card-value">{formatValue(totalExpense)}</span>
      </div>

      <div className="card summary-card monthly-summary-card projected">
        <h3 className="card-title">Saldo projetado</h3>
        <span className="card-value">{formatValue(projectedBalance)}</span>
      </div>
    </div>
  );
}

MonthlySummary.propTypes = {
  balance: PropTypes.number.isRequired,
  totalIncome: PropTypes.number.isRequired,
  totalExpense: PropTypes.number.isRequired,
  projectedBalance: PropTypes.number.isRequired,
};
