// src/components/ui/forms/TransactionForm.jsx

import React, { useState } from 'react';
import { useHousehold } from '../../../hooks/useHousehold';
import useTransactionData from '../../../hooks/useTransactionData';
import { saveTransaction } from '../../../services/transactionService'; // Importa o serviço

const TransactionForm = ({ transactionId, onSaveSuccess }) => {
  const { householdId, user } = useHousehold();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    description, setDescription, supplier, setSupplier, amount, setAmount,
    category, setCategory, type, setType, date, setDate, installments, setInstallments,
    loading: dataLoading, categories, types, transactionGroupId,
  } = useTransactionData(transactionId);

  const isIncomeType = (selectedTypeId) => {
    const transactionType = types.find(t => t.id === selectedTypeId);
    return transactionType && transactionType.name.toUpperCase() === 'RECEITA';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    let signedAmount = parseFloat(amount);
    if (!isIncomeType(type)) {
      signedAmount *= -1;
    }

    try {
      await saveTransaction({
        householdId,
        userId: user.uid,
        formData: {
          description, supplier, amount: signedAmount, category, type, date, installments
        },
        editingData: {
          transactionId, transactionGroupId
        }
      });

      alert('Transação salva com sucesso!');
      if (onSaveSuccess) onSaveSuccess();

    } catch (error) {
      alert(`Erro ao salvar: ${error.message}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (dataLoading) return <div>Carregando formulário...</div>;

  return (
    <form onSubmit={handleSave}>
      <h3>{transactionId ? 'Editar Transação' : 'Adicionar Transação'}</h3>
      <input type="text" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <input type="text" placeholder="Fornecedor/Origem" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
      <input type="number" placeholder="Valor Total (sem sinal)" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
      <label>Data da 1ª Parcela:</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <label>Número de Parcelas:</label>
      <input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} required min="1" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} required>
        <option value="" disabled>Selecione a Categoria *</option>
        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)} required>
        <option value="" disabled>Selecione o Tipo *</option>
        {types.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
      </select>
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? 'Processando...' : (transactionId ? 'Salvar Edição' : 'Adicionar Transação')}
      </button>
    </form>
  );
};

export default TransactionForm;