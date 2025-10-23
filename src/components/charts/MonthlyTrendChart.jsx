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
  Tooltip
} from "chart.js";

/**
 * Gráfico de tendência mensal: saldo, receitas ou despesas ao longo dos últimos 12 meses.
 *
 * @prop {Array<number>} incomeData - Receitas mês a mês
 * @prop {Array<number>} expenseData - Despesas mês a mês
 * @prop {Array<number>} balanceData - Saldo mês a mês
 * @prop {string} metric - "balance" | "income" | "expense"
 * @prop {function} onChangeMetric - Troca a métrica visualizada
 */
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip);

const COLORS = {
  balance: "#4392f1",
  income: "#40ba4f",
  expense: "#f55c48"
};

const LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function MonthlyTrendChart({
  incomeData,
  expenseData,
  balanceData,
  metric,
  onChangeMetric
}) {
  // Seleciona a série para mostrar
  const datasets = {
    balance: {
      label: "Saldo",
      data: balanceData,
      borderColor: COLORS.balance,
      backgroundColor: COLORS.balance + "11",
      tension: 0.32,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 7
    },
    income: {
      label: "Entradas",
      data: incomeData,
      borderColor: COLORS.income,
      backgroundColor: COLORS.income + "11",
      tension: 0.32,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 7
    },
    expense: {
      label: "Saídas",
      data: expenseData,
      borderColor: COLORS.expense,
      backgroundColor: COLORS.expense + "11",
      tension: 0.32,
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 7
    }
  };

  const chartData = {
    labels: LABELS,
    datasets: [datasets[metric]]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            context.parsed.y?.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            })
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            });
          }
        }
      }
    }
  };

  return (
    <div style={{ marginTop: "2em" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
        <strong style={{ fontSize: 16 }}>Evolução (últimos 12 meses):</strong>
        <select
          value={metric}
          onChange={e => onChangeMetric(e.target.value)}
          style={{ padding: "4px 16px", fontSize: "1em", borderRadius: 6, border: "1px solid #ddd" }}
        >
          <option value="balance">Saldo</option>
          <option value="income">Entradas</option>
          <option value="expense">Saídas</option>
        </select>
      </div>
      <Line data={chartData} options={chartOptions} height={320} />
    </div>
  );
}

MonthlyTrendChart.propTypes = {
  incomeData: PropTypes.arrayOf(PropTypes.number).isRequired,
  expenseData: PropTypes.arrayOf(PropTypes.number).isRequired,
  balanceData: PropTypes.arrayOf(PropTypes.number).isRequired,
  metric: PropTypes.oneOf(["balance", "income", "expense"]).isRequired,
  onChangeMetric: PropTypes.func.isRequired
};
