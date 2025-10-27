// src/components/lists/TransactionList.jsx

import React, { useRef, useEffect, useMemo } from "react";
import { useAppContext } from "../../context/useAppContext";
import TransactionItem from "../ui/TransactionItem";
import useAllTransactions from "../../hooks/useAllTransactions";
import formatCurrency from "../../utils/formatCurrency";
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
  const categoryMap = useMemo(
    () => Object.fromEntries((categories || []).map((c) => [c.id, c.name])),
    [categories]
  );
  const typeMap = useMemo(
    () => Object.fromEntries((types || []).map((t) => [t.id, t.name])),
    [types]
  );
  const userMap = useMemo(
    () => Object.fromEntries((users || []).map((u) => [u.uid, u.displayName])),
    [users]
  );

  // ✅ SOLUÇÃO MODERNA: IntersectionObserver
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore]);

  if (loading && transactions.length === 0) {
    return <div className="loading">Carregando transações...</div>;
  }

  return (
    <div className="transaction-list-wrapper">
      <div className="card">
        <h3>
          Total: {formatCurrency(totalAmount)}
        </h3>
      </div>

      {transactions.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-title">Nenhuma transação encontrada</div>
          <p className="empty-state-description">
            Tente ajustar os filtros ou adicione uma nova transação.
          </p>
        </div>
      )}

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

      {hasMore && (
        <div
          ref={loadMoreRef}
        />
      )}

      {loading && transactions.length > 0 && (
        <div className="loading">Carregando mais...</div>
      )}
    </div>
  );
};

export default TransactionList;
