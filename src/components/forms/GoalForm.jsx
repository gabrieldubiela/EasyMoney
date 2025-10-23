// src/components/forms/GoalForm.jsx

import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createGoal, updateGoal } from "../../services/goalService";

const GoalForm = ({ goal, onSuccess, onCancel }) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(goal?.name || "");
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount || "");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ? goal.targetDate.slice(0, 10) : "");
  const [expectedReturnRate, setExpectedReturnRate] = useState(goal?.expectedReturnRate || "");
  const [isSaving, setIsSaving] = useState(false);

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
      alert("Erro ao salvar meta: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>{goal ? "Editar Meta" : "Nova Meta"}</h3>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Valor Meta"
        value={targetAmount}
        onChange={e => setTargetAmount(e.target.value)}
        required
        min="0"
      />
      <input
        type="date"
        placeholder="Data final"
        value={targetDate}
        onChange={e => setTargetDate(e.target.value)}
      />
      <input
        type="number"
        placeholder="Retorno Previsto (%)"
        value={expectedReturnRate}
        onChange={e => setExpectedReturnRate(e.target.value)}
        min="0"
        step="0.01"
      />
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Salvando..." : (goal ? "Salvar Alterações" : "Adicionar Meta")}
      </button>
      {onCancel && (
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
};

export default GoalForm;
