// src/components/forms/HouseholdUpdateForm.jsx

import React, { useEffect, useState } from 'react';
import useHouseholdUpdater from '../../hooks/useHouseholdUpdater';

export default function HouseholdUpdateForm({ householdId, showToast, canEdit }) {
  const { household, loading, error, fetch, updateHouseholdName } = useHouseholdUpdater(householdId);
  const [householdName, setHouseholdName] = useState('');

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
    if (!householdId || householdName.trim() === "") {
      showToast?.("error", "Nome não pode ser vazio.");
      return;
    }
    const success = await updateHouseholdName(householdName.trim());
    if (success) {
      showToast?.({ type: "success", message: "Nome da família atualizado!" });
    } else {
      showToast?.({ type: "error", message: "Erro ao atualizar nome!" });
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <label>Nome da Família:</label>
      <input
        type="text"
        value={householdName}
        onChange={e => setHouseholdName(e.target.value)}
        placeholder="Ex: Silva"
        required
        disabled={loading || !canEdit}
      />
      <button type="submit" disabled={loading || !canEdit}>
        {loading ? "Atualizando..." : "Atualizar Nome"}
      </button>
      {!canEdit && <p style={{ color: '#888', fontSize: 13 }}>Somente administradores podem editar a família.</p>}
      {error && <p style={{ color: 'red', fontSize: 13 }}>Erro: {error.message}</p>}
    </form>
  );
}
