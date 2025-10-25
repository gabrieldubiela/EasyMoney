// src/components/charts/CategorySummaryTable.jsx

import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "../../styles/charts.css";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico do tipo pizza/donut que mostra a utilização do orçamento anual
 * por categoria (realizado vs restante), priorizando as principais categorias.
 */
export default function DonutBudgetChart({
  categories,
  summary,
  typeFilter,
  maxCategories = 5,
}) {
  const filtered = typeFilter
    ? categories.filter((c) => c.typeId === typeFilter)
    : categories;

  const sorted = filtered
    .slice()
    .sort(
      (a, b) =>
        (summary[b.id]?.annualBudget || 0) -
        (summary[a.id]?.annualBudget || 0)
    )
    .slice(0, maxCategories);

  const labels = sorted.map((cat) => cat.name);
  const realized = sorted.map((cat) => summary[cat.id]?.realizedTotal || 0);
  const remaining = sorted.map((cat) => {
    const s = summary[cat.id];
    if (!s) return 0;
    return Math.max((s.annualBudget || 0) - (s.realizedTotal || 0), 0);
  });

  // Pegando as cores do tema
  const style = getComputedStyle(document.documentElement);
  const colorSuccess = style.getPropertyValue("--color-success").trim() || "rgba(34,197,94,1)";
  const colorSuccessBG = `${colorSuccess}80`; // transparência p/ gráfico
  const colorDanger = style.getPropertyValue("--color-danger").trim() || "rgba(220,38,38,1)";
  const colorDangerBG = `${colorDanger}22`;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Realizado",
        data: realized,
        backgroundColor: colorSuccessBG,
        borderColor: colorSuccess,
        borderWidth: 1.5,
      },
      {
        label: "Restante",
        data: remaining,
        backgroundColor: colorDangerBG,
        borderColor: colorDanger,
        borderWidth: 1.5,
      },
    ],
  };

  const chartOptions = {
    cutout: "68%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: style.getPropertyValue("--color-text").trim(),
          font: { family: "Inter", size: 13 },
        },
      },
      tooltip: {
        backgroundColor: style.getPropertyValue("--color-surface").trim(),
        titleColor: style.getPropertyValue("--color-text").trim(),
        bodyColor: style.getPropertyValue("--color-text-muted").trim(),
        borderColor: style.getPropertyValue("--color-border").trim(),
        borderWidth: 1,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}`,
        },
      },
    },
  };

  return (
    <div className="donut-budget-chart chart-wrapper">
      <strong className="chart-title">Budget Utilization (Top Categories)</strong>
      <Doughnut data={chartData} options={chartOptions}/>
      <div className="chart-note">
        {typeFilter ? `Type: ${typeFilter}` : "All types"}
      </div>
    </div>
  );
}

DonutBudgetChart.propTypes = {
  categories: PropTypes.array.isRequired,
  summary: PropTypes.object.isRequired,
  typeFilter: PropTypes.string,
  maxCategories: PropTypes.number,
};
