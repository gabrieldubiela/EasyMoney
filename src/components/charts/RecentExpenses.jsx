// src/components/charts/RecentExpenses.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * Lista as transações recentes mostrando só a primeira parcela (installments_current === 1) ou transações únicas.
 * Exibe usuário, categoria, valor, tipo e data.
 *
 * @prop {Array} transactions - [{ id, amount, ... }]
 * @prop {number} maxItems - Máx. de itens a exibir (default: 10)
 */
export default function RecentExpenses({ transactions, maxItems = 10 }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="recent-expenses" style={{ marginTop: "2em", color: "#999" }}>
        No transactions to show.
      </div>
    );
  }

  // Mostra só a 1ª parcela ou não parceladas
  const filtered = transactions.filter(
    tx => !tx.installments_current || tx.installments_current === 1
  );

  // Mais recentes primeiro, limitado a maxItems
  const sorted = filtered
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, maxItems);

  return (
    <div className="recent-expenses" style={{ marginTop: "2em", maxWidth: 600 }}>
      <strong style={{ fontSize: 15, marginBottom: 8, display: "block" }}>
        Recent transactions:
      </strong>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f3f3fa" }}>
            <th style={{ padding: "0.5em" }}>Date</th>
            <th style={{ padding: "0.5em" }}>Description</th>
            <th style={{ padding: "0.5em" }}>Category</th>
            <th style={{ padding: "0.5em" }}>Type</th>
            <th style={{ padding: "0.5em" }}>User</th>
            <th style={{ padding: "0.5em" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(tx => (
            <tr key={tx.id} style={{
              background: tx.amount < 0 ? "#ffeaea" : "#e6f7ee"
            }}>
              <td style={{ padding: "0.5em" }}>{formatDate(tx.date)}</td>
              <td style={{ padding: "0.5em" }}>{tx.description}</td>
              <td style={{ padding: "0.5em" }}>{tx.categoryName}</td>
              <td style={{ padding: "0.5em" }}>{tx.typeName}</td>
              <td style={{ padding: "0.5em" }}>{tx.userName}</td>
              <td style={{
                padding: "0.5em",
                color: tx.amount < 0 ? "#a22525" : "#188710",
                fontWeight: "bold"
              }}>
                {formatValue(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div style={{ margin: "1em", color: "#999" }}>
          No transactions to show.
        </div>
      )}
    </div>
  );
}

function formatDate(date) {
  let d = date;
  if (date && typeof date.toDate === "function") d = date.toDate();
  if (!(d instanceof Date)) d = new Date(d);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatValue(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });
}

RecentExpenses.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      description: PropTypes.string,
      categoryName: PropTypes.string,
      typeName: PropTypes.string,
      userName: PropTypes.string,
      date: PropTypes.any,
      installments_current: PropTypes.number
    })
  ),
  maxItems: PropTypes.number
};
