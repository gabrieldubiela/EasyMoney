// src/components/charts/CategorySummaryTable.jsx

import React from "react";
import PropTypes from "prop-types";
import "../../styles/tables.css";
import "../../styles/progress-bars.css";

/**
 * Tabela analítica de desempenho das categorias no mês atual.
 * Exibe orçamento planejado, gasto, percentual de execução e saldo.
 */
export default function CategorySummaryTable({ categories, summary, typeFilter }) {
  const monthIdx = new Date().getMonth();

  const formatValue = (v) =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const filteredCategories = typeFilter
    ? categories.filter((cat) => cat.typeId === typeFilter)
    : categories;

  // Adaptação para progress bar padronizada
  const getProgressClass = (percent) => {
    if (percent < 80) return "progress-fill-success";
    if (percent < 100) return "progress-fill-warning";
    return "progress-fill-danger";
  };

  // Adaptação para linha de alerta
  const getRowClass = (percent, idx) =>
    percent >= 90
      ? "table-row--critical"
      : idx % 2 === 1
        ? "table-row--zebra"
        : "";

  return (
    <div className="table-wrapper category-summary-table">
      <table className="table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Orçado Mês</th>
            <th>Realizado Mês</th>
            <th>% Realizado</th>
            <th>Saldo Restante</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((cat, idx) => {
            const monthsArr = summary?.[cat.id]?.months || [];
            const data = monthsArr[monthIdx] || {};
            const percent = data.percent || 0;
            const remaining = (data.planned || 0) - (data.spent || 0);
            const progressClass = getProgressClass(percent);
            const rowClass = getRowClass(percent, idx);

            return (
              <tr key={cat.id} className={rowClass}>
                <td><strong>{cat.name}</strong></td>
                <td>{formatValue(data.planned || 0)}</td>
                <td>{formatValue(data.spent || 0)}</td>
                <td>
                  <div className="progress-bar-container">
                    <span>{percent}%</span>
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill ${progressClass}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className={remaining >= 0 ? "cell-positive" : "cell-negative"}>
                  {formatValue(remaining)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

CategorySummaryTable.propTypes = {
  categories: PropTypes.array.isRequired,
  summary: PropTypes.object.isRequired,
  typeFilter: PropTypes.string,
};
