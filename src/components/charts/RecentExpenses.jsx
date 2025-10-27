import React from "react";
import PropTypes from "prop-types";
import "../../styles/tables.css";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";

export default function RecentExpenses({
  transactions,
  categories = [],
  types = [],
}) {

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c.name ?? c.categoryName ?? c.nome ?? ""])),
    [categories]
  );
  const typeMap = React.useMemo(
    () => Object.fromEntries(types.map(t => [t.id, t.name ?? t.typeName ?? t.tipo ?? ""])),
    [types]
  );

  if (!transactions || transactions.length === 0)
    return (
      <div className="table-wrapper recent-expenses">
        <div className="empty-table-row">Sem transações.</div>
      </div>
    );

  return (
    <div className="table-wrapper recent-expenses">
      <h3>Últimas Transações:</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Tipo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{formatDate(tx.date)}</td>
              <td>{tx.description}</td>
              <td>{categoryMap[tx.category_id] || "N/A"}</td>
              <td>{typeMap[tx.type_id] || "N/A"}</td>
              <td className="amount-negative">
                {formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

RecentExpenses.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      amount: PropTypes.number,
      description: PropTypes.string,
      date: PropTypes.any,
      category_id: PropTypes.string,
      type_id: PropTypes.string,
    })
  ),
  categories: PropTypes.array,
  types: PropTypes.array,
};
