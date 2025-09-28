// src/components/ui/lists/TransactionList.jsx

import React from 'react';
import { useHousehold } from '../../../hooks/useHousehold';
import TransactionItem from '../items/TransactionItem';
import { useTransactionList } from '../../../hooks/useTransactionList';

const TransactionList = ({ filters, categories, types }) => {
  const { users } = useHousehold();
  const { transactions, loading, hasMore, loadMore } = useTransactionList(filters);

  // Mapeia os metadados uma vez para performance
  // ✅ CORREÇÃO 1: Garante que categories não seja undefined
  const categoryMap = React.useMemo(() => Object.fromEntries((categories || []).map(c => [c.id, c.name])), [categories]);
  
  // ✅ CORREÇÃO 2: Garante que types não seja undefined
  const typeMap = React.useMemo(() => Object.fromEntries((types || []).map(t => [t.id, t.name])), [types]);
  
  // 💥 CORREÇÃO 3: ESSENCIAL. Garante que users não seja undefined, já que vem do Contexto
  const userMap = React.useMemo(() => Object.fromEntries((users || []).map(u => [u.uid, u.displayName])), [users]);

  // Calcula o total apenas das transações visíveis
  // ✅ BOA PRÁTICA: Usar (transactions || []) aqui também, caso o hook inicialize como undefined
  const totalAmount = (transactions || []).reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading && transactions.length === 0) {
    return <div>Carregando transações...</div>;
  }

  return (
    <div>
      <h3>Total Visível: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>

      {transactions.length === 0 && !loading && (
        <div>Nenhuma transação encontrada com os filtros aplicados.</div>
      )}

      <div>
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
        <button onClick={loadMore}>Carregar Mais</button>
      )}

      {loading && transactions.length > 0 && <div>Carregando mais...</div>}
    </div>
  );
};

export default TransactionList;