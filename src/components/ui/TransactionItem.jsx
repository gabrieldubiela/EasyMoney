// src/components/ui/TransactionItem.jsx

import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { convertPlannedToEffective, deleteTransaction, deleteInstallmentGroup } from '../../services/transactionService';
import TransactionForm from '../forms/TransactionForm';
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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowDeleteModal(false)} // FECHA ao clicar fora
        >
          <div
            style={{
              background: "var(--color-surface, #222f37)",
              borderRadius: 12,
              boxShadow: "0 8px 48px rgba(0,0,0,0.25)",
              padding: "32px 24px 24px 24px",
              minWidth: 270,
              maxWidth: 330,
              color: "var(--color-text, #fff)",
              textAlign: "center",
            }}
            onClick={e => e.stopPropagation()} // NÃO fecha ao clicar dentro do box
          >
            <h3 style={{ fontSize: '1.14rem', marginBottom: 16 }}>Excluir transação parcelada</h3>
            <p style={{ marginBottom: 18 }}>Você deseja excluir <b>apenas esta parcela</b> ou <b>todo o grupo</b> de parcelas?</p>
            <button
              className="btn btn-danger btn-block"
              style={{ marginBottom: 10, width: "100%" }}
              onClick={async () => {
                setShowDeleteModal(false);
                await deleteTransaction(householdId, transaction.id, isPlanned);
                if (onDelete) onDelete(transaction);
              }}
            >Apenas esta parcela</button>
            <button
              className="btn btn-warning btn-block"
              style={{ marginBottom: 16, width: "100%" }}
              onClick={async () => {
                setShowDeleteModal(false);
                await deleteInstallmentGroup(householdId, transaction.transactionGroupId, isPlanned);
                if (onDelete) onDelete(transaction);
              }}
            >Todo o grupo de parcelas</button>
            <button
              className="btn btn-ghost btn-block"
              style={{ width: '100%' }} onClick={() => setShowDeleteModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
