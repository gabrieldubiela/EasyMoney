// src/components/charts/RecentExpenses.jsx

import React from "react";
import PropTypes from "prop-types";
import "../../styles/tables.css";

/**
 * Lista de transações recentes do usuário.
 * Exibe somente transações únicas ou a primeira parcela.
 */
export default function RecentExpenses({ transactions, maxItems = 10 }) {
  if (!transactions || transactions.length === 0)
    return (
      <div className="table-wrapper recent-expenses">
        <div className="empty-table-row">No transactions to show.</div>
      </div>
    );

  const filtered = transactions.filter(
    (tx) => !tx.installments_current || tx.installments_current === 1
  );

  const sorted = filtered
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, maxItems);

  return (
    <div className="table-wrapper recent-expenses">
      <strong>Recent transactions:</strong>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>User</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td className="empty-table-row" colSpan="6">
                No transactions to show.
              </td>
            </tr>
          ) : (
            sorted.map((tx, idx) => {
              const isExpense = tx.amount < 0;
              const rowClass =
                isExpense
                  ? "table-row--critical"
                  : idx % 2 === 1
                    ? "table-row--zebra"
                    : "";
              return (
                <tr key={tx.id} className={rowClass}>
                  <td>{formatDate(tx.date)}</td>
                  <td>{tx.description}</td>
                  <td>{tx.categoryName}</td>
                  <td>{tx.typeName}</td>
                  <td>{tx.userName}</td>
                  <td className={isExpense ? "amount-negative" : "amount-positive"}>
                    {formatValue(tx.amount)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
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
    minimumFractionDigits: 2,
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
      installments_current: PropTypes.number,
    })
  ),
  maxItems: PropTypes.number,
};
