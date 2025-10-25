// src/components/lists/TransactionList.jsx

import React, { useRef, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import TransactionItem from "../ui/TransactionItem";
import useAllTransactions from "../../hooks/useAllTransactions";
import "../../styles/cards.css";
import "../../styles/lists.css";

/**
 * Lista de transações com filtragem, scroll infinito e soma total do filtro.
 *
 * @param {object} filters
 * @param {Array} categories
 * @param {Array} types
 */
const TransactionList = ({ filters, categories, types }) => {
  const { users } = useAppContext();
  const {
    transactions,
    loading,
    hasMore,
    loadMore,
    totalAmount,
  } = useAllTransactions(filters);

  // Mapas para lookup rápido
  const categoryMap = React.useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.id, c.name])),
    [categories]
  );
  const typeMap = React.useMemo(
    () => Object.fromEntries((types || []).map((t) => [t.id, t.name])),
    [types]
  );
  const userMap = React.useMemo(
    () => Object.fromEntries((users || []).map((u) => [u.uid, u.displayName])),
    [users]
  );

  // Scroll infinito nativo (carrega mais ao chegar ao fundo)
  const scrollRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading) return;
      const el = scrollRef.current;
      if (el && el.getBoundingClientRect().bottom <= window.innerHeight + 60) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadMore]);

  if (loading && transactions.length === 0) {
    return <div className="loading">Carregando transações...</div>;
  }

  return (
    <div ref={scrollRef} className="transaction-list-wrapper">
      <div className="card">
        <h3>
          Total Filtrado:{" "}
          {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </h3>
      </div>

      {/* Estado vazio */}
      {transactions.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-title">Nenhuma transação encontrada</div>
          <p className="empty-state-description">Tente ajustar os filtros ou adicione uma nova transação.</p>
        </div>
      )}

      {/* Lista */}
      <div className="transaction-list">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            categoryName={categoryMap[transaction.category_id] || "N/A"}
            typeName={typeMap[transaction.type_id] || "N/A"}
            userName={userMap[transaction.user_id] || "Desconhecido"}
        />
        ))}
      </div>

      {/* Scroll feedback */}
      {loading && transactions.length > 0 && (
        <div className="loading">Carregando mais...</div>
      )}
    </div>
  );
};

export default TransactionList;
