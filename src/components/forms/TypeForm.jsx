// src/components/forms/TypeForm.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { createType, updateType, deleteType } from '../../services/typeService';

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
    const trimmed = name.trim();
    if (!trimmed) return;
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
      alert(err.message);
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
      } catch (e) {
        alert('Erro ao excluir tipo!');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSave}
      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
    >
      <input
        type="text"
        placeholder="Nome do tipo"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: 160 }}
        required
      />
      <label>
        <input
          type="checkbox"
          checked={isIncome}
          onChange={e => setIsIncome(e.target.checked)}
          style={{ marginRight: 4 }}
        />
        Receita?
      </label>
      <button type="submit" disabled={loading || !name.trim()}>
        {loading ? 'Salvando...' : item ? 'Salvar' : 'Adicionar'}
      </button>
      {item && (
        <>
          <button type="button" onClick={handleDelete} style={{ color: 'red' }} disabled={loading}>
            Excluir
          </button>
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        </>
      )}
    </form>
  );
};

export default TypeForm;
