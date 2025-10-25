// src/components/forms/TransactionForm.jsx

import React, { useState } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { createTransaction } from '../../services/transactionService';
import useAllCategories from '../../hooks/useAllCategories';
import useAllTypes from '../../hooks/useAllTypes';
import "../../styles/forms.css";
import "../../styles/buttons.css";

/**
 * Formulário de criação e edição de transações financeiras.
 */
const TransactionForm = ({ transactionId, onSaveSuccess, isPlanned = false }) => {
  const { householdId, user } = useAppContext();
  const { categories, loading: loadingCategories } = useAllCategories();
  const { types, loading: loadingTypes } = useAllTypes();

  const [isProcessing, setIsProcessing] = useState(false);
  const today = new Date().toISOString().substring(0, 10);

  // Estados do formulário
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(today);
  const [installments, setInstallments] = useState(1);

  const [formError, setFormError] = useState("");

  const isIncomeType = (selectedTypeId) => {
    const transactionType = types.find((t) => t.id === selectedTypeId);
    return transactionType?.isIncome === true; 
  };

  const getSignedAmount = (rawAmount, typeId) => {
    const numeric = parseFloat(rawAmount);
    if (isNaN(numeric) || numeric <= 0) throw new Error('Insira um valor positivo.');
    return isIncomeType(typeId) ? numeric : -numeric;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!householdId || !user) return;

    setFormError("");
    setIsProcessing(true);

    try {
      if (!description.trim() || !supplier.trim() || !amount || !category || !type || !date) {
        throw new Error("Preencha todas as informações obrigatórias.");
      }

      const signedAmount = getSignedAmount(amount, type);
      const trimmedDescription = description.trim();
      const trimmedSupplier = supplier.trim();

      // 🔍 DEBUG - ADICIONE ISSO
    console.log('📤 ENVIANDO PARA O SERVICE:', {
      householdId,
      userId: user.uid,
      description: trimmedDescription,
      supplier: trimmedSupplier,
      amount: signedAmount,
      category_id: category,
      type_id: type,
      date,
      installments_total: installments,
    });

      if (isPlanned) {
        await createTransaction(
          {
            householdId,
            userId: user.uid,
            description: trimmedDescription,
            supplier: trimmedSupplier,
            amount: signedAmount,
            category_id: category,
            type_id: type,
            date,
            installments_total: installments,
          },
          true
        );
      } else {
        await createTransaction(
          {
            householdId,
            userId: user.uid,
            description: trimmedDescription,
            supplier: trimmedSupplier,
            amount: signedAmount,
            category_id: category,
            type_id: type,
            date,
            installments_total: installments,
          },
          false
        );
      }

      alert('Transação salva com sucesso!');
      if (onSaveSuccess) onSaveSuccess();

      setDescription('');
      setSupplier('');
      setAmount('');
      setCategory('');
      setType('');
      setDate(today);
      setInstallments(1);
    } catch (error) {
      setFormError(error.message || "Erro ao salvar transação.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingCategories || loadingTypes)
    return <div className="loading">Carregando informações...</div>;

  if (categories.length === 0 || types.length === 0)
    return (
      <div className="alert alert-info">
        Configure categorias e tipos antes de adicionar transações.
      </div>
    );

  return (
    <form onSubmit={handleSave} className="form transaction-form" autoComplete="off">
      <div className="form-group">
        <label htmlFor="tx-description" className="form-label required">
          Descrição
        </label>
        <input
          id="tx-description"
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tx-supplier" className="form-label required">
          Fornecedor / Origem
        </label>
        <input
          id="tx-supplier"
          type="text"
          placeholder="Fornecedor / Origem"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tx-amount" className="form-label required">
          Valor
        </label>
        <input
          id="tx-amount"
          type="number"
          placeholder="Valor"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="0.01"
          step="0.01"
        />
      </div>

      <div className="form-group">
        <label htmlFor="tx-date" className="form-label required">
          Data
        </label>
        <input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {!isPlanned && (
        <div className="form-group">
          <label htmlFor="tx-installments" className="form-label">
            Parcelas
          </label>
          <input
            id="tx-installments"
            type="number"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            min="1"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="tx-category" className="form-label required">
          Categoria
        </label>
        <select
          id="tx-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            Categoria
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tx-type" className="form-label required">
          Tipo
        </label>
        <select
          id="tx-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="" disabled>
            Tipo
          </option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isProcessing}
        >
          {isProcessing
            ? 'Processando...'
            : transactionId
              ? 'Salvar Edição'
              : 'Adicionar Transação'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
