// src/components/forms/TypeForm.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { createType, updateType, deleteType } from '../../services/typeService';
import "../../styles/forms.css";
import "../../styles/buttons.css";

const TypeForm = ({
  item = null,         // Se existir, é edição; se não, é adição
  existingTypes = [],
  onSuccess,
  onCancel
}) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(item ? item.name : '');
  const [isIncome, setIsIncome] = useState(item ? !!item.isIncome : false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setIsIncome(!!item.isIncome);
    }
  }, [item]);

  const isDuplicate =
    existingTypes.some(
      t => t.name.toLowerCase() === name.trim().toLowerCase() && (!item || t.id !== item.id)
    );

  const handleSave = async (e) => {
    e?.preventDefault && e.preventDefault();
    setFormError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Informe o nome do tipo.");
      return;
    }
    setLoading(true);

    try {
      if (item) {
        // Edição
        if (trimmed !== item.name || isIncome !== !!item.isIncome) {
          await updateType(householdId, item.id, trimmed, isIncome);
        }
      } else {
        // Adição
        if (isDuplicate) throw new Error(`O tipo "${trimmed}" já existe.`);
        await createType(householdId, trimmed, isIncome);
        setName('');
        setIsIncome(false);
      }
      if (onSuccess) onSuccess();
      if (item && onCancel) onCancel();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (window.confirm(`Excluir o tipo "${item.name}"?`)) {
      setLoading(true);
      try {
        await deleteType(householdId, item.id);
        if (onSuccess) onSuccess();
      } catch {
        setFormError("Erro ao excluir tipo!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="form type-form"
      autoComplete="off"
    >
      <div className="form-group">
        <label className="form-label required" htmlFor="type-name">
          Nome do tipo
        </label>
        <input
          type="text"
          id="type-name"
          placeholder="Nome do tipo"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={loading}
      />
      </div>
      <div className="form-group" >
        <input
          type="checkbox"
          id="type-isincome"
          checked={isIncome}
          onChange={e => setIsIncome(e.target.checked)}
          disabled={loading}
      />
        <label htmlFor="type-isincome" className="form-label">
          Receita?
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading || !name.trim()}>
          {loading ? 'Salvando...' : item ? 'Salvar' : 'Adicionar'}
        </button>
        {item && (
          <>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              Excluir
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </button>
          </>
        )}
      </div>
      {formError && <div className="form-error">{formError}</div>}
      {isDuplicate && !item && (
        <div className="form-error">
          Esse tipo já existe.
        </div>
      )}
    </form>
  );
};

export default TypeForm;
