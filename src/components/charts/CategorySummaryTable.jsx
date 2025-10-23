// src/components/charts/CategorySummaryTable.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Tabela analítica de desempenho das categorias no mês atual.
 * Exibe, para cada categoria:
 * - Nome
 * - Orçado do mês (planned)
 * - Realizado do mês (spent)
 * - % do orçado realizado (barra visual, colorida)
 * - Saldo restante do orçamento desse mês
 *
 * @prop {Array} categories - [{ id, name, typeId, ... }]
 * @prop {Object} summary - useBudgetSummary()[catId].months[monthIdx] + info agregada
 * @prop {string|null} typeFilter - Filtra por tipo ("fixed", "variable") — null mostra todas
 */
export default function CategorySummaryTable({ categories, summary, typeFilter }) {
  const monthIdx = new Date().getMonth();

  // Helper: valor formatado pt-BR
  const formatValue = v =>
    v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    });

  const filteredCategories = typeFilter
    ? categories.filter(cat => cat.typeId === typeFilter)
    : categories;

  return (
    <div className="category-summary-table" style={{ marginTop: "1.5em" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f3fa" }}>
            <th style={{ padding: "0.5em 1em" }}>Categoria</th>
            <th style={{ padding: "0.5em 1em" }}>Orçado Mês</th>
            <th style={{ padding: "0.5em 1em" }}>Realizado Mês</th>
            <th style={{ padding: "0.5em 1em" }}>% Realizado</th>
            <th style={{ padding: "0.5em 1em" }}>Saldo Restante</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(cat => {
            const monthsArr = summary?.[cat.id]?.months || [];
            const data = monthsArr[monthIdx] || {};
            const percent = data.percent || 0;
            return (
              <tr key={cat.id} style={{ background: percent >= 90 ? "#ffe8e8" : "white" }}>
                <td style={{ padding: "0.5em 1em", fontWeight: "bold" }}>{cat.name}</td>
                <td style={{ padding: "0.5em 1em" }}>{formatValue(data.planned || 0)}</td>
                <td style={{ padding: "0.5em 1em" }}>{formatValue(data.spent || 0)}</td>
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
                  {formatValue((data.planned || 0) - (data.spent || 0))}
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
  typeFilter: PropTypes.string
};
