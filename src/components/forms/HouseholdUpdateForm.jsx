// src/components/forms/HouseholdUpdateForm.jsx

/* Formulário para atualizar o nome da família. */
import React, { useEffect, useState } from 'react';
import useHouseholdUpdater from '../../hooks/useHouseholdUpdater';
import "../../styles/forms.css";
import "../../styles/buttons.css";

export default function HouseholdUpdateForm({ householdId, showToast, canEdit }) {
  const { household, loading, error, fetch, updateHouseholdName } = useHouseholdUpdater(householdId);
  const [householdName, setHouseholdName] = useState('');
  const [formError, setFormError] = useState("");

  // Carrega dados atuais da família
  useEffect(() => {
    if (householdId) fetch();
  }, [householdId, fetch]);

  useEffect(() => {
    if (household && household.familyName) {
      setHouseholdName(household.familyName);
    }
  }, [household]);

  // Atualiza nome da família
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!householdId || householdName.trim() === "") {
      setFormError("Nome não pode ser vazio.");
      showToast?.("error", "Nome não pode ser vazio.");
      return;
    }
    const success = await updateHouseholdName(householdName.trim());
    if (success) {
      showToast?.({ type: "success", message: "Nome da família atualizado!" });
    } else {
      setFormError("Erro ao atualizar nome!");
      showToast?.({ type: "error", message: "Erro ao atualizar nome!" });
    }
  };

  return (
    <form onSubmit={handleUpdate} className="form household-update-form" autoComplete="off">
      <div className="form-group">
        <label className="form-label required" htmlFor="household-name">
          Nome da Família
        </label>
        <input
          id="household-name"
          type="text"
          value={householdName}
          onChange={e => setHouseholdName(e.target.value)}
          placeholder="Ex: Silva"
          required
          disabled={loading || !canEdit}
      />
      </div>

      {formError && <p className="form-error">{formError}</p>}
      {!canEdit && (
        <p className="form-info">
          Somente administradores podem editar a família.
        </p>
      )}
      {error && (
        <p className="form-error">
          Erro: {error.message}
        </p>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !canEdit}
        >
          {loading ? "Atualizando..." : "Atualizar Nome"}
        </button>
      </div>
    </form>
  );
}
