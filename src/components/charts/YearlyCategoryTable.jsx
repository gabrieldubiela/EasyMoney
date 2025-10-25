// src/components/charts/YearlyCategoryTable.jsx

import React from "react";
import PropTypes from "prop-types";
import "../../styles/tables.css";
import "../../styles/progress-bars.css";

/**
 * Tabela anual de desempenho por categoria — mostra orçado, realizado e progresso.
 */
export default function YearlyCategoryTable({ categories, summary, typeFilter }) {
  const formatValue = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const filteredCategories = typeFilter
    ? categories.filter((cat) => cat.typeId === typeFilter)
    : categories;

  const getProgressClass = (percent) => {
    if (percent < 80) return "progress-fill-success";
    if (percent < 100) return "progress-fill-warning";
    return "progress-fill-danger";
  };

  const getRowClass = (percent, idx) =>
    percent >= 90
      ? "table-row--critical"
      : idx % 2 === 1
        ? "table-row--zebra"
        : "";

  return (
    <div className="table-wrapper yearly-category-table">
      <table className="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Annual Budget</th>
            <th>Actual to Date</th>
            <th>% Realized</th>
            <th>Remaining for Year</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((cat, idx) => {
            const data = summary?.[cat.id] || {};
            const percent = data.percentRealized || 0;
            const rowClass = getRowClass(percent, idx);
            const fillClass = getProgressClass(percent);

            return (
              <tr key={cat.id} className={rowClass}>
                <td>{cat.name}</td>
                <td>{formatValue(data.annualBudget || 0)}</td>
                <td>{formatValue(data.realizedTotal || 0)}</td>
                <td className="progress-cell">
                  <div className="progress-bar-container">
                    <span>{percent}%</span>
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill ${fillClass}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                    </div>
                  </div>
                </td>
                <td className={percent >= 100 ? "cell-negative" : "cell-positive"}>
                  {formatValue(data.remainingTotal || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

YearlyCategoryTable.propTypes = {
  categories: PropTypes.array.isRequired,
  summary: PropTypes.object.isRequired,
  typeFilter: PropTypes.string,
};
