// src/components/forms/GoalAllocationForm.jsx

import React, { useState } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createGoalAllocation } from "../../services/goalAllocationService";
import "../../styles/forms.css";
import "../../styles/buttons.css";

const GoalAllocationForm = ({
  investments = [],
  goals = [],
  onSuccess,
  onCancel
}) => {
  const { householdId } = useAppContext();
  const [investmentId, setInvestmentId] = useState("");
  const [goalId, setGoalId] = useState("");
  const [percentage, setPercentage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!investmentId || !goalId || !percentage) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }
    if (Number(percentage) < 1 || Number(percentage) > 100) {
      setFormError("O percentual deve estar entre 1 e 100.");
      return;
    }
    setIsSaving(true);
    try {
      await createGoalAllocation(
        householdId,
        investmentId,
        goalId,
        Number(percentage)
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError("Erro ao criar alocação: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form goal-allocation-form" autoComplete="off">
      <h3>Alocar Investimento para Meta</h3>

      <div className="form-group">
        <label className="form-label required" htmlFor="investment">
          Investimento
        </label>
        <select
          id="investment"
          value={investmentId}
          onChange={e => setInvestmentId(e.target.value)}
          required
          disabled={isSaving}
        >
          <option value="" disabled>
            Selecione Investimento
          </option>
          {investments.map(inv => (
            <option key={inv.id} value={inv.id}>
              {inv.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label required" htmlFor="goal">
          Meta
        </label>
        <select
          id="goal"
          value={goalId}
          onChange={e => setGoalId(e.target.value)}
          required
          disabled={isSaving}
        >
          <option value="" disabled>
            Selecione Meta
          </option>
          {goals.map(goal => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label required" htmlFor="percentage">
          Percentual (%)
        </label>
        <input
          id="percentage"
          type="number"
          placeholder="Percentual (%)"
          value={percentage}
          onChange={e => setPercentage(e.target.value)}
          required
          min="1"
          max="100"
          disabled={isSaving}
        />
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar Alocação"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default GoalAllocationForm;
