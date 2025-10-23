// src/components/forms/CategoryForm.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/useAppContext';
import { createCategory, updateCategory, deleteCategory } from '../../services/categoryService';

const CategoryForm = ({
  item = null,         // Se existir, é edição; se não, é adição
  existingCategories = [],
  onSuccess,
  onCancel
}) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(item ? item.name : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) setName(item.name);
  }, [item]);

  // Verifica duplicidade para cadastro (não na edição se nome não mudar)
  const isDuplicate =
    existingCategories.some(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && (!item || c.id !== item.id)
    );

  const handleSave = async (e) => {
    e?.preventDefault && e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);

    try {
      if (item) {
        // Edição
        if (trimmed !== item.name) {
          await updateCategory(householdId, item.id, trimmed);
        }
      } else {
        // Adição
        if (isDuplicate) throw new Error(`A categoria "${trimmed}" já existe.`);
        await createCategory(householdId, trimmed);
        setName('');
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
    if (window.confirm(`Excluir a categoria "${item.name}"?`)) {
      setLoading(true);
      try {
        await deleteCategory(householdId, item.id);
        if (onSuccess) onSuccess();
      } catch (e) {
        alert('Erro ao excluir categoria!');
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
        placeholder="Nome da categoria"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: 180 }}
        required
      />
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

export default CategoryForm;
