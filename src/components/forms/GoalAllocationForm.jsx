// src/components/forms/GoalAllocationForm.jsx

import React, { useState } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createGoalAllocation } from "../../services/goalAllocationService";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createGoalAllocation(householdId, investmentId, goalId, Number(percentage));
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Erro ao criar alocação: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>Alocar Investimento para Meta</h3>
      <select value={investmentId} onChange={e => setInvestmentId(e.target.value)} required>
        <option value="" disabled>Selecione Investimento</option>
        {investments.map(inv => (
          <option key={inv.id} value={inv.id}>{inv.name}</option>
        ))}
      </select>
      <select value={goalId} onChange={e => setGoalId(e.target.value)} required>
        <option value="" disabled>Selecione Meta</option>
        {goals.map(goal => (
          <option key={goal.id} value={goal.id}>{goal.name}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Percentual (%)"
        value={percentage}
        onChange={e => setPercentage(e.target.value)}
        required
        min="1"
        max="100"
      />
      <button type="submit" disabled={isSaving}>Salvar Alocação</button>
      {onCancel && (
        <button type="button" className="btn-outline" onClick={onCancel}>Cancelar</button>
      )}
    </form>
  );
};

export default GoalAllocationForm;
