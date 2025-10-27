// src/components/charts/YearlyCategoryTable.jsx

import React from "react";
import PropTypes from "prop-types";
import formatCurrency from "../../utils/formatCurrency";
import { getProgressClass, getProgressWidthClass, getRowClass } from "../../utils/progressBarClass";
import "../../styles/tables.css";
import "../../styles/progress-bars.css";

/**
 * Tabela anual de desempenho por categoria — mostra orçado, realizado e progresso.
 */
export default function YearlyCategoryTable({ categories, summary }) {
  return (
    <div className="table-wrapper yearly-category-table">
      <h3>Orçamento Anual</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Orçamento</th>
            <th>Realizado</th>
            <th>% Realizada</th>
            <th>Disponível</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, idx) => {
            // ✅ AJUSTE: Calcular totais anuais a partir dos dados mensais
            const monthsData = summary?.[cat.id]?.months || [];
            const annualBudget = monthsData.reduce((acc, month) => acc + (month.planned || 0), 0);
            const realizedTotal = monthsData.reduce((acc, month) => acc + (month.spent || 0), 0);
            const remainingTotal = annualBudget - realizedTotal;
            const percentRealized = annualBudget > 0 ? Math.round((realizedTotal / annualBudget) * 100) : 0;

            const rowClass = getRowClass(percentRealized, idx);
            const fillClass = getProgressClass(percentRealized);
            const widthClass = getProgressWidthClass(percentRealized);

            return (
              <tr key={cat.id} className={rowClass}>
                <td>{cat.name}</td>
                <td>{formatCurrency(annualBudget)}</td>
                <td>{formatCurrency(realizedTotal)}</td>
                <td className="progress-cell">
                  <div className="progress-bar-container">
                    <span>{percentRealized}%</span>
                    <div className="progress-bar-bg">
                      <div className={`progress-bar-fill ${fillClass} ${widthClass}`} />
                    </div>
                  </div>
                </td>
                <td className={remainingTotal < 0 ? "cell-negative" : "cell-positive"}>
                  {formatCurrency(remainingTotal)}
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
};
