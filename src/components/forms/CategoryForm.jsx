// src/components/forms/CategoryForm.jsx

import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createCategory, updateCategory, deleteCategory } from "../../services/categoryService";
import "../../styles/CategoryForm.css";

const CategoryForm = ({
  item = null, 
  existingCategories = [],
  onSuccess,
  onCancel,
}) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(item ? item.name : "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) setName(item.name);
  }, [item]);

  const isDuplicate = existingCategories.some(
    (c) =>
      c.name.toLowerCase() === name.trim().toLowerCase() &&
      (!item || c.id !== item.id)
  );

  const handleSave = async (e) => {
    e?.preventDefault?.();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);

    try {
      if (item) {
        if (trimmed !== item.name) {
          await updateCategory(householdId, item.id, trimmed);
        }
      } else {
        if (isDuplicate)
          throw new Error(`A categoria "${trimmed}" já existe.`);
        await createCategory(householdId, trimmed);
        setName("");
      }
      onSuccess?.();
      if (item) onCancel?.();
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
        onSuccess?.();
      } catch {
        alert("Erro ao excluir categoria!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form className="category-form" onSubmit={handleSave}>
      <input
        type="text"
        placeholder="Nome da categoria"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={loading}
      />
      {isDuplicate && !item && (
        <span className="duplicate-warning">Essa categoria já existe.</span>
      )}
      <div className="button-group">
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Salvando..." : item ? "Salvar" : "Adicionar"}
        </button>
        {item && (
          <>
            <button
              type="button"
              onClick={handleDelete}
              className="btn-danger"
              disabled={loading}
            >
              Excluir
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </form>
  );
};

export default CategoryForm;
