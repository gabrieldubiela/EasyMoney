import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../../utils/formatCurrency";
import { getProgressClass, getProgressWidthClass, getRowClass } from "../../utils/progressBarClass";
import "../../styles/tables.css";

/**
 * Tabela analítica de desempenho das categorias no mês atual.
 * Exibe orçamento planejado, gasto, percentual de execução e saldo.
 */
export default function CategorySummaryTable({ categories, summary, typeFilter }) {
  const monthIdx = new Date().getMonth();

  const formatValue = (v) => formatCurrency(v);

  const filteredCategories = typeFilter
    ? categories.filter((cat) => cat.typeId === typeFilter)
    : categories;

  return (
    <div className="table-wrapper category-summary-table">
      <h3>Orçamento Mensal</h3>
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
            const progressWidthClass = getProgressWidthClass(percent);
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
                      <div className={`progress-bar-fill ${progressClass} ${progressWidthClass}`} />
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
