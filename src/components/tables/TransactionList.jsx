// src/components/ui/lists/TransactionList.jsx

import React from 'react';
import { useAppContext } from '../../context/useAppContext';
import TransactionItem from '../ui/TransactionItem';
import { useTransactionList } from '../../hooks/useTransactionList';

const TransactionList = ({ filters, categories, types }) => {
  const { users } = useAppContext();
  const { transactions, loading, hasMore, loadMore } = useTransactionList(filters);
  const categoryMap = React.useMemo(() => Object.fromEntries((categories || []).map(c => [c.id, c.name])), [categories]);
  const typeMap = React.useMemo(() => Object.fromEntries((types || []).map(t => [t.id, t.name])), [types]);
  const userMap = React.useMemo(() => Object.fromEntries((users || []).map(u => [u.uid, u.displayName])), [users]);

  // Calcula o total apenas das transações visíveis
  const totalAmount = (transactions || []).reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading && transactions.length === 0) {
    return <div className="loading">Carregando transações...</div>;
  }

  return (
    <div>
      <div className="card">
        <h3>Total: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
      </div>

      {transactions.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-title">Nenhuma transação encontrada</div>
          <p className="empty-state-description">Tente ajustar os filtros ou adicione uma nova transação.</p>
        </div>
      )}

      <div className="transaction-list">
        {transactions.map(transaction => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            categoryName={categoryMap[transaction.category_id] || 'N/A'}
            typeName={typeMap[transaction.type_id] || 'N/A'}
            userName={userMap[transaction.user_id] || 'Desconhecido'}
          />
        ))}
      </div>

      {hasMore && !loading && (
        <div className="text-center mt-lg">
          <button onClick={loadMore} className="primary">Carregar Mais</button>
        </div>
      )}

      {loading && transactions.length > 0 && <div className="loading">Carregando mais...</div>}
    </div>
  );
};

export default TransactionList;