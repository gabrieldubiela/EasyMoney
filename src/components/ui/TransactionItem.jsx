import React from 'react';
import { useAppContext } from '../../context/useAppContext';
import { convertPlannedToEffective, deleteTransaction } from '../../services/transactionService';
import "../../styles/buttons.css"; 

export default function TransactionItem({
  transaction,
  userName,
  categoryName,
  typeName,
  isPlanned = false,
  onConvert,
  onDelete,
  onEdit
}) {
  const { householdId, user } = useAppContext();
  const formattedAmount = (transaction.amount || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const transactionDate =
    transaction.date?.toDate?.() instanceof Date
      ? transaction.date.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : (transaction.date && typeof transaction.date === 'string'
        ? new Date(transaction.date).toLocaleDateString('pt-BR')
        : 'Data Desconhecida');

  const handleConvert = async (e) => {
    e.stopPropagation();
    try {
      await convertPlannedToEffective(householdId, transaction, user.uid);
      if (onConvert) onConvert(transaction);
    } catch (error) {
      console.error('Erro ao converter planejada:', error);
      if (onConvert) onConvert(undefined, error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteTransaction(householdId, transaction.id, isPlanned);
      if (onDelete) onDelete(transaction);
    } catch (err) {
      console.error("Erro ao excluir transação:", err);
      if (onDelete) onDelete(undefined, err);
    }
  };

  const handleEdit = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    if (!isPlanned && onEdit) onEdit(transaction);
  };

  return (
    <div
      className={`transaction-item${!isPlanned && onEdit ? " transaction-item--clickable" : ""}`}
      onClick={handleEdit}
    >
      <div className="transaction-item-header">
        <div className="transaction-item-description">
          {transaction.description}
          {transaction.supplier && (
            <span className="transaction-item-supplier"> - {transaction.supplier}</span>
          )}
        </div>
        <div className={`transaction-item-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
          {formattedAmount}
        </div>
      </div>
      <div className="transaction-item-details">
        <span className="transaction-item-date">{transactionDate}</span>
        {transaction.installments_total > 1 && (
          <span className="transaction-item-installments">
            Parc. {transaction.installments_current}/{transaction.installments_total}
          </span>
        )}
      </div>
      <div className="transaction-item-meta">
        <span className="transaction-item-category">Categoria: {categoryName}</span>
        <span className="transaction-item-type">Tipo: {typeName}</span>
      </div>
      <div className="transaction-item-footer">
        <span className="transaction-item-user">Adicionado por: {userName}</span>
        <div className="transaction-item-actions">
          {isPlanned && (
            <button
              onClick={handleConvert}
              className="btn btn-success btn-small"
              type="button"
            >
              Converter em Paga
            </button>
          )}
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-small"
            type="button"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
