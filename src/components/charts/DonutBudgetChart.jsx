// src/components/charts/DonutBudgetChart.jsx

import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

/**
 * Gráfico do tipo pizza/donut mostrando orçamento anual: realizado vs. restante, das categorias mais relevantes.
 *
 * @prop {Array} categories - [{ id, name, typeId, ... }]
 * @prop {Object} summary - useBudgetSummary resultado (anual/mensal)
 * @prop {string|null} typeFilter - "fixed" | "variable" | null
 * @prop {number} maxCategories - quantas fatias exibir (default: 5)
 */
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutBudgetChart({ categories, summary, typeFilter, maxCategories = 5 }) {
  // Filtra por tipo
  const filtered = typeFilter
    ? categories.filter(c => c.typeId === typeFilter)
    : categories;

  // Seleciona as top categorias por orçamento anual (ou mensal se preferir adaptar)
  const sorted = filtered
    .slice()
    .sort((a, b) => (summary[b.id]?.annualBudget || 0) - (summary[a.id]?.annualBudget || 0))
    .slice(0, maxCategories);

  // Monta as fatias do gráfico
  const labels = sorted.map(cat => cat.name);
  const realized = sorted.map(cat => summary[cat.id]?.realizedTotal || 0);
  const remaining = sorted.map(cat => {
    const s = summary[cat.id];
    if (!s) return 0;
    return Math.max((s.annualBudget || 0) - (s.realizedTotal || 0), 0);
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Realizado",
        data: realized,
        backgroundColor: "#40ba4f66",
        borderColor: "#188710",
        borderWidth: 1
      },
      {
        label: "Restante",
        data: remaining,
        backgroundColor: "#fbecec",
        borderColor: "#b51a1a",
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: { position: "right" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })}`
        }
      }
    }
  };

  return (
    <div style={{ marginTop: "2em", maxWidth: 400 }}>
      <strong style={{ fontSize: 15, marginBottom: 12, display: "block" }}>
        Budget utilization (Top categories)
      </strong>
      <Doughnut data={chartData} options={chartOptions} />
      <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>
        {typeFilter ? `Type: ${typeFilter}` : "All types"}
      </div>
    </div>
  );
}

DonutBudgetChart.propTypes = {
  categories: PropTypes.array.isRequired,
  summary: PropTypes.object.isRequired,
  typeFilter: PropTypes.string,
  maxCategories: PropTypes.number
};
