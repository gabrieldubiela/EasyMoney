// src/components/forms/GoalForm.jsx

import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createGoal, updateGoal } from "../../services/goalService";
import "../../styles/forms.css";
import "../../styles/buttons.css";

const GoalForm = ({ goal, onSuccess, onCancel }) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || "");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ? goal.targetDate.slice(0, 10) : "");
  const [expectedReturnRate, setExpectedReturnRate] = useState(goal?.expectedReturnRate || "");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (goal) {
      setName(goal.name || "");
      setTargetAmount(goal.targetAmount || "");
      setTargetDate(goal.targetDate ? goal.targetDate.slice(0, 10) : "");
      setExpectedReturnRate(goal.expectedReturnRate || "");
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !targetAmount) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }
    setIsSaving(true);
    try {
      if (goal) {
        await updateGoal(householdId, goal.id, {
          name: name.trim(),
          targetAmount: Number(targetAmount),
          targetDate: targetDate ? new Date(targetDate) : null,
          expectedReturnRate: Number(expectedReturnRate)
        });
      } else {
        await createGoal(householdId, {
          name: name.trim(),
          targetAmount: Number(targetAmount),
          targetDate: targetDate ? new Date(targetDate) : null,
          expectedReturnRate: Number(expectedReturnRate)
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError("Erro ao salvar meta: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form goal-form" autoComplete="off">
      <h3>{goal ? "Editar Meta" : "Nova Meta"}</h3>

      <div className="form-group">
        <label className="form-label required" htmlFor="goal-name">
          Nome
        </label>
        <input
          id="goal-name"
          type="text"
          placeholder="Ex: Reserva de Emergência"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={isSaving}
      />
      </div>

      <div className="form-group">
        <label className="form-label required" htmlFor="goal-value">
          Valor meta
        </label>
        <input
          id="goal-value"
          type="number"
          placeholder="Valor da meta"
          value={targetAmount}
          onChange={e => setTargetAmount(e.target.value)}
          required
          min="0"
          disabled={isSaving}
      />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="goal-date">
          Data final
        </label>
        <input
          id="goal-date"
          type="date"
          placeholder="Data final"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          disabled={isSaving}
      />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="goal-roi">
          Retorno Previsto (%)
        </label>
        <input
          id="goal-roi"
          type="number"
          placeholder="Retorno previsto (%)"
          value={expectedReturnRate}
          onChange={e => setExpectedReturnRate(e.target.value)}
          min="0"
          step="0.01"
          disabled={isSaving}
      />
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? "Salvando..." : (goal ? "Salvar Alterações" : "Adicionar Meta")}
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

export default GoalForm;
