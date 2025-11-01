// src/components/charts/MonthlySummary.jsx

import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../../utils/formatCurrency";
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
  return (
    <div className="summary-container monthly-summary-container">
      <h3>Balanço Mensal</h3>
      <div className="card summary-card monthly-summary-card balance">
        <h3 className="card-title">Saldo do mês</h3>
        <span className="card-value">{formatCurrency(balance)}</span>
      </div>

      <div className="card summary-card monthly-summary-card income">
        <h3 className="card-title">Entradas</h3>
        <span className="card-value">{formatCurrency(totalIncome)}</span>
      </div>

      <div className="card summary-card monthly-summary-card expense">
        <h3 className="card-title">Saídas</h3>
        <span className="card-value">{formatCurrency(totalExpense)}</span>
      </div>

      <div className="card summary-card monthly-summary-card projected">
        <h3 className="card-title">Saldo projetado</h3>
        <span className="card-value">{formatCurrency(projectedBalance)}</span>
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
