// src/components/ui/TransactionItem.jsx

import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { convertPlannedToEffective, deleteTransaction, deleteInstallmentGroup } from '../../services/transactionService';
import TransactionForm from '../forms/TransactionForm';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import "../../styles/buttons.css";

export default function TransactionItem({
  transaction,
  categoryName,
  typeName,
  isPlanned = false,
  onConvert,
  onDelete,
}) {
  const { householdId, user } = useAppContext();
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formattedAmount = formatCurrency(transaction.amount || 0);
  const transactionDate = formatDate(transaction.date);

  const handleConvert = async (e) => {
    e.stopPropagation();
    try {
      const newId = await convertPlannedToEffective(householdId, transaction, user.uid);
      if (onConvert) {
        onConvert({
          ...transaction,
          id: newId,
          isPlanned: false
        });
      }
    } catch (error) {
      console.error('Erro ao converter planejada:', error);
      if (onConvert) onConvert(undefined, error);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (transaction.installments_total > 1) {
      setShowDeleteModal(true);
      return;
    }
    // Exclusão normal
    deleteTransaction(householdId, transaction.id, isPlanned)
      .then(() => onDelete && onDelete(transaction))
      .catch((err) => {
        console.error("Erro ao excluir transação:", err);
        onDelete && onDelete(undefined, err);
      });
  };

  const handleEditOpen = (e) => {
    e.stopPropagation();
    setEditing(true);
  };

  const handleEditDone = () => {
    setEditing(false);
  };

  // Se está editando, mostra o form preenchido
  if (editing) {
    return (
      <div className="transaction-item transaction-item--editing">
        <TransactionForm
          transactionId={transaction.id}
          editMode={true}
          initialData={transaction}
          isPlanned={isPlanned}
          onSaveSuccess={handleEditDone}
          onCancel={handleEditDone}
        />
      </div>
    );
  }

  // Normal quando não está editando
  return (
    <div className="transaction-item">
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
            onClick={handleEditOpen}
            className="btn btn-success btn-small"
            type="button"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger btn-small"
            type="button"
          >
            Excluir
          </button>
        </div>
      </div>
      {showDeleteModal && (
        <div
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
          >
            <h3>Excluir transação parcelada</h3>
            <p>Você deseja excluir <b>apenas esta parcela</b> ou <b>todo o grupo</b> de parcelas?</p>
            <button
              className="btn btn-danger btn-block"
              onClick={async () => {
                setShowDeleteModal(false);
                await deleteTransaction(householdId, transaction.id, isPlanned);
                if (onDelete) onDelete(transaction);
              }}
            >Apenas esta parcela</button>
            <button
              className="btn btn-warning btn-block"
              onClick={async () => {
                setShowDeleteModal(false);
                await deleteInstallmentGroup(householdId, transaction.transactionGroupId, isPlanned);
                if (onDelete) onDelete(transaction);
              }}
            >Todo o grupo de parcelas</button>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => setShowDeleteModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
