// src/components/charts/MonthlyTrendChart.jsx

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";
import "../../styles/charts.css";
import formatCurrency from "../../utils/formatCurrency";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Filler);

export default function MonthlyTrendChart({
  incomeData,
  expenseData,
  balanceData,
  metric,
  onChangeMetric,
}) {
  // Lê as variáveis da paleta do CSS
  const style = getComputedStyle(document.documentElement);

  const COLORS = useMemo(() => ({
    balance: style.getPropertyValue("--color-primary").trim() || "#1bdd93",
    income: style.getPropertyValue("--color-success").trim() || "#22C55E",
    expense: style.getPropertyValue("--color-danger").trim() || "#DC2626",
    textMuted: style.getPropertyValue("--color-text-muted").trim() || "#6B7280",
    grid: style.getPropertyValue("--color-border").trim() || "#E5E7EB",
    tooltipBg: style.getPropertyValue("--color-surface").trim() || "#fff",
    tooltipBorder: style.getPropertyValue("--color-border").trim() || "#E5E7EB",
    tooltipTitle: style.getPropertyValue("--color-text").trim() || "#111827",
  }), [style]);

  const LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const datasets = {
    balance: {
      label: "Saldo",
      data: balanceData,
      borderColor: COLORS.balance,
      backgroundColor: `${COLORS.balance}22`,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      fill: true,
    },
    income: {
      label: "Receitas",
      data: incomeData,
      borderColor: COLORS.income,
      backgroundColor: `${COLORS.income}22`,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      fill: true,
    },
    expense: {
      label: "Despesas",
      data: expenseData,
      borderColor: COLORS.expense,
      backgroundColor: `${COLORS.expense}22`,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      fill: true,
    }
  };

  const getChartDatasets = () => {
    if (metric === "all") {
      return [datasets.income, datasets.expense, datasets.balance];
    } else {
      return [datasets[metric]];
    }
  };

  const chartData = {
    labels: LABELS,
    datasets: getChartDatasets(),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: COLORS.tooltipBg,
        borderColor: COLORS.tooltipBorder,
        borderWidth: 1,
        titleColor: COLORS.tooltipTitle,
        bodyColor: COLORS.textMuted,
        callbacks: {
          label: (context) => formatCurrency(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { color: COLORS.grid },
        ticks: { color: COLORS.textMuted },
      },
      y: {
        grid: { color: COLORS.grid },
        ticks: {
          color: COLORS.textMuted,
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <div className="chart-wrapper monthly-trend">
      <h3>Evolução no Ano</h3>
      <div className="monthly-trend-header">
        <select
          className="monthly-trend-select"
          value={metric}
          onChange={e => onChangeMetric(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="balance">Saldo</option>
          <option value="income">Receita</option>
          <option value="expense">Despesa</option>
        </select>
      </div>
      <div>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}


MonthlyTrendChart.propTypes = {
  incomeData: PropTypes.arrayOf(PropTypes.number).isRequired,
  expenseData: PropTypes.arrayOf(PropTypes.number).isRequired,
  balanceData: PropTypes.arrayOf(PropTypes.number).isRequired,
  metric: PropTypes.oneOf(["all", "balance", "income", "expense"]).isRequired,
  onChangeMetric: PropTypes.func.isRequired,
};
