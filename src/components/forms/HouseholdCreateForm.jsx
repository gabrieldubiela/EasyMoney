import React, { useState } from "react";
import { createHousehold } from "../../services/householdService";
import { useAppContext } from "../../context/useAppContext";

export default function HouseholdCreateForm({ showToast, onCreated }) {
  const { user } = useAppContext();
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleCreate = async (e) => {
  e.preventDefault();
  setFormError("");
  const trimmedName = familyName ? familyName.trim() : "";
  if (!trimmedName) {
    setFormError("Nome não pode ser vazio.");
    showToast?.({ type: "error", message: "Nome não pode ser vazio!" });
    return;
  }

  setLoading(true);
  try {
    const newId = await createHousehold(trimmedName, user.uid);
    setFamilyName("");
    setFormError("");
    showToast?.({ type: "success", message: "Família criada!" });
    onCreated?.(newId, trimmedName);
  } catch (err) {
    setFormError("Erro ao criar família! " + (err?.message || ""));
    showToast?.({ type: "error", message: "Erro ao criar família!" });
  }
  setLoading(false);
};

  return (
    <form
      onSubmit={handleCreate}
      className="form household-create-form"
      autoComplete="off"
    >
      <div className="form-group">
        <label className="form-label required" htmlFor="new-family-name">
          Nome da nova família
        </label>
        <input
          id="new-family-name"
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="Ex: Souza"
          required
          disabled={loading}
        />
      </div>
      {formError && <p className="form-error">{formError}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? "Criando..." : "Criar família"}
        </button>
      </div>
    </form>
  );
}
