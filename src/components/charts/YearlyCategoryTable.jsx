// src/components/charts/YearlyCategoryTable.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Tabela analítica anual (dashboard): categorias, orçamento anual, gasto/realizado e progresso.
 * 
 * @prop {Array} categories - [{ id, name, typeId, ... }]
 * @prop {Object} summary - useBudgetSummary resultado anual (por categoria)
 * @prop {string|null} typeFilter - Filtro por tipo ("fixed", "variable") ou null
 */
export default function YearlyCategoryTable({ categories, summary, typeFilter }) {
  const formatValue = value =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const filteredCategories = typeFilter
    ? categories.filter(cat => cat.typeId === typeFilter)
    : categories;

  return (
    <div className="yearly-category-table" style={{ marginTop: "1.5em" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f7f9fa" }}>
            <th style={{ padding: "0.5em 1em" }}>Category</th>
            <th style={{ padding: "0.5em 1em" }}>Annual Budget</th>
            <th style={{ padding: "0.5em 1em" }}>Actual to Date</th>
            <th style={{ padding: "0.5em 1em" }}>% Realized</th>
            <th style={{ padding: "0.5em 1em" }}>Remaining for Year</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(cat => {
            const data = summary?.[cat.id] || {};
            const percent = data.percentRealized || 0;
            return (
              <tr key={cat.id} style={{ background: percent >= 90 ? "#ffe8e8" : "white" }}>
                <td style={{ padding: "0.5em 1em", fontWeight: "bold" }}>{cat.name}</td>
                <td style={{ padding: "0.5em 1em" }}>{formatValue(data.annualBudget || 0)}</td>
                <td style={{ padding: "0.5em 1em" }}>{formatValue(data.realizedTotal || 0)}</td>
                <td style={{ padding: "0.5em 1em", minWidth: 120 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{percent}%</span>
                    <div style={{
                      width: "60px",
                      height: "8px",
                      borderRadius: 4,
                      background: "#eee",
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${Math.min(percent, 100)}%`,
                        height: "100%",
                        background:
                          percent < 80
                            ? "#188710"
                            : percent < 100
                            ? "#e69915"
                            : "#b51a1a"
                      }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "0.5em 1em", color: percent >= 100 ? "#b51a1a" : "#226654" }}>
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
  typeFilter: PropTypes.string
};
