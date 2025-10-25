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
      label: "Entradas",
      data: incomeData,
      borderColor: COLORS.income,
      backgroundColor: `${COLORS.income}22`,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      fill: true,
    },
    expense: {
      label: "Saídas",
      data: expenseData,
      borderColor: COLORS.expense,
      backgroundColor: `${COLORS.expense}22`,
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 7,
      fill: true,
    }
  };

  const chartData = {
    labels: LABELS,
    datasets: [datasets[metric]],
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
          label: (context) =>
            context.parsed.y?.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
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
          callback: (value) =>
            value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            }),
        },
      },
    },
  };

  return (
    <div className="chart-wrapper monthly-trend">
      <div className="monthly-trend-header">
        <strong className="chart-title">Evolução (últimos 12 meses):</strong>
        <select
          className="monthly-trend-select"
          value={metric}
          onChange={e => onChangeMetric(e.target.value)}
        >
          <option value="balance">Saldo</option>
          <option value="income">Entradas</option>
          <option value="expense">Saídas</option>
        </select>
      </div>
      <div>
        <Line data={chartData} options={chartOptions}/>
      </div>
    </div>
  );
}

MonthlyTrendChart.propTypes = {
  incomeData: PropTypes.arrayOf(PropTypes.number).isRequired,
  expenseData: PropTypes.arrayOf(PropTypes.number).isRequired,
  balanceData: PropTypes.arrayOf(PropTypes.number).isRequired,
  metric: PropTypes.oneOf(["balance", "income", "expense"]).isRequired,
  onChangeMetric: PropTypes.func.isRequired,
};
