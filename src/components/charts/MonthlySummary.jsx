// src/components/charts/MonthlySummary.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Componente de resumo financeiro do mês atual.
 * - Saldo atual
 * - Total de receitas
 * - Total de despesas
 * - Saldo projetado (inclui planejados)
 *
 * @prop {number} balance - Saldo atual.
 * @prop {number} totalIncome - Receitas do mês.
 * @prop {number} totalExpense - Despesas do mês.
 * @prop {number} projectedBalance - Projeção do saldo final do mês.
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
    <div className="monthly-summary-container" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      {/* Saldo atual */}
      <div className="monthly-summary-card" style={{ background: "#e6f7ee", padding: "1em 2em", borderRadius: 8, minWidth: 180 }}>
        <h3 style={{ color: "#226654", marginBottom: 6 }}>Saldo do mês</h3>
        <span style={{ fontSize: 22, fontWeight: "bold" }}>{formatValue(balance)}</span>
      </div>

      {/* Receitas */}
      <div className="monthly-summary-card" style={{ background: "#f3fff3", padding: "1em 2em", borderRadius: 8, minWidth: 180 }}>
        <h3 style={{ color: "#188710", marginBottom: 6 }}>Entradas</h3>
        <span style={{ fontSize: 22, fontWeight: "bold" }}>{formatValue(totalIncome)}</span>
      </div>

      {/* Despesas */}
      <div className="monthly-summary-card" style={{ background: "#fbecec", padding: "1em 2em", borderRadius: 8, minWidth: 180 }}>
        <h3 style={{ color: "#a22525", marginBottom: 6 }}>Saídas</h3>
        <span style={{ fontSize: 22, fontWeight: "bold" }}>{formatValue(totalExpense)}</span>
      </div>

      {/* Projeção de saldo */}
      <div className="monthly-summary-card" style={{ background: "#e9ecfb", padding: "1em 2em", borderRadius: 8, minWidth: 180 }}>
        <h3 style={{ color: "#284aa2", marginBottom: 6 }}>Saldo projetado</h3>
        <span style={{ fontSize: 22, fontWeight: "bold" }}>{formatValue(projectedBalance)}</span>
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
