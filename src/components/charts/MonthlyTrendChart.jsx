// src/components/charts/MonthlyTrendChart.jsx

import React from "react";
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
} from "chart.js";
import "../../styles/charts.css";
import formatCurrency from "../../utils/formatCurrency";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip);

/**
 * Gráfico de tendência mensal: saldo, receitas e despesas dos 12 últimos meses.
 */
export default function MonthlyTrendChart({
  incomeData,
  expenseData,
  balanceData,
  metric,
  onChangeMetric,
}) {
  const style = getComputedStyle(document.documentElement);
  const COLORS = {
    balance: style.getPropertyValue("--color-primary").trim() || "#4392f1",
    income: style.getPropertyValue("--color-success").trim() || "#40ba4f",
    expense: style.getPropertyValue("--color-danger").trim() || "#f55c48",
  };

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

  // Lógica para mostrar um ou todos os datasets
  const getChartDatasets = () => {
    if (metric === "all") {
      // Mostrar todas as linhas
      return [datasets.income, datasets.expense, datasets.balance];
    } else {
      // Mostrar apenas a linha selecionada
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
        backgroundColor: style.getPropertyValue("--color-surface"),
        borderColor: style.getPropertyValue("--color-border"),
        borderWidth: 1,
        titleColor: style.getPropertyValue("--color-text"),
        bodyColor: style.getPropertyValue("--color-text-muted"),
        callbacks: {
          label: (context) => formatCurrency(context.parsed.y),
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(100,100,100,0.08)" },
        ticks: { color: style.getPropertyValue("--color-text-muted") },
      },
      y: {
        grid: { color: "rgba(100,100,100,0.08)" },
        ticks: {
          color: style.getPropertyValue("--color-text-muted"),
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
