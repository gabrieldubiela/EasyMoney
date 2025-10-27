import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { createTransaction, updateTransaction } from '../../services/transactionService';
import useAllCategories from '../../hooks/useAllCategories';
import useAllTypes from '../../hooks/useAllTypes';
import formatCurrency from "../../utils/formatCurrency";
import "../../styles/forms.css";
import "../../styles/buttons.css";

function formatCurrencyInput(value) {
  // Remove tudo que não for dígito
  const cleaned = String(value).replace(/\D/g, "");
  if (!cleaned) return formatCurrency(0);
  // Divide por 100 e formata "visualmente" como dinheiro
  return formatCurrency(Number(cleaned) / 100);
}

const TransactionForm = ({
  transactionId,
  onSaveSuccess,
  onCancel,
  isPlanned = false,
  initialData = null,
  editMode = false
}) => {
  const { householdId, user } = useAppContext();
  const { categories, loading: loadingCategories } = useAllCategories();
  const { types, loading: loadingTypes } = useAllTypes();
  const isInstallment = initialData && initialData.installments_total > 1;
  const [editAllInstallments, setEditAllInstallments] = useState(false);
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
  const [formError, setFormError] = useState('');
  const [amountInput, setAmountInput] = useState("");

  // Valores originais para cálculo do total
  const [originalAmount, setOriginalAmount] = useState(0);
  const [originalInstallments, setOriginalInstallments] = useState(1);

  // Preencher campos se editar
  useEffect(() => {
    if (initialData) {
      const absAmount = Math.abs(initialData.amount || 0);
      setAmountInput(formatCurrencyInput((absAmount * 100).toFixed(0)));
      setAmount(Number(absAmount).toFixed(2));
      const totalInstallments = initialData.installments_total || 1;

      setDescription(initialData.description || '');
      setSupplier(initialData.supplier || '');
      setAmount(absAmount);
      setOriginalAmount(absAmount);
      setOriginalInstallments(totalInstallments);
      setCategory(initialData.category_id || '');
      setType(initialData.type_id || '');
      setDate(
        initialData.date?.toDate
          ? initialData.date.toDate().toISOString().substr(0, 10)
          : (initialData.date ? initialData.date.substr(0, 10) : today)
      );
      setInstallments(totalInstallments);
    }
  }, [initialData, today]);

  // Atualiza o valor quando muda a opção de editar todas
  useEffect(() => {
    if (isInstallment && originalAmount > 0) {
      if (editAllInstallments) {
        // Mostra valor total (valor unitário × número de parcelas)
        setAmount(originalAmount * originalInstallments);
      } else {
        // Mostra valor unitário
        setAmount(originalAmount);
      }
    }
  }, [editAllInstallments, originalAmount, originalInstallments, isInstallment]);

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

    setFormError('');
    setIsProcessing(true);

    try {
      if (!description.trim() || !supplier.trim() || !amount || !category || !type || !date) {
        throw new Error("Preencha todas as informações obrigatórias.");
      }

      const signedAmount = getSignedAmount(amount, type);
      const trimmedDescription = description.trim();
      const trimmedSupplier = supplier.trim();

      if (editMode && transactionId) {
        await updateTransaction(
          {
            householdId,
            transactionId,
            transactionGroupId: initialData?.transactionGroupId,
            editAllInstallments,
            userId: user.uid,
            description: trimmedDescription,
            supplier: trimmedSupplier,
            amount: signedAmount,
            category_id: category,
            type_id: type,
            date,
            installments_total: installments,
          },
          isPlanned
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
          isPlanned
        );
      }

      if (onSaveSuccess) onSaveSuccess();

      // Limpa formulário só se não for edição
      if (!editMode) {
        setDescription('');
        setSupplier('');
        setAmount('');
        setCategory('');
        setType('');
        setDate(today);
        setInstallments(1);
      }
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
          Valor {isInstallment && editAllInstallments ? '(Total do Grupo)' : ''}
        </label>
        <input
          id="tx-amount"
          type="text"
          placeholder="Valor"
          value={amountInput}
          onChange={e => {
            const onlyDigits = e.target.value.replace(/\D/g, "");
            setAmountInput(formatCurrencyInput(onlyDigits));
            if (onlyDigits) {
              setAmount((parseInt(onlyDigits, 10) / 100).toFixed(2));
            } else {
              setAmount("");
            }
          }}
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

      {/* PERGUNTA SOBRE EDITAR TODAS AS PARCELAS */}
      {isInstallment && (
        <div className="form-group form-checkbox-inline">
          <label htmlFor="edit-all-installments">
            Editar todas as parcelas
            <input
              type="checkbox"
              id="edit-all-installments"
              checked={editAllInstallments}
              onChange={e => setEditAllInstallments(e.target.checked)}
            />
          </label>
        </div>
      )}

      {formError && <div className="form-error">{formError}</div>}

      <div className="form-actions">
        <div className="btn-group">
          {editMode && onCancel && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isProcessing}
          >
            {isProcessing
              ? 'Processando...'
              : editMode && transactionId
                ? 'Salvar Edição'
                : 'Adicionar Transação'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TransactionForm;
