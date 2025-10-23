// src/components/forms/InvestmentForm.jsx

import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createInvestment, updateInvestment } from "../../services/investmentService";

const InvestmentForm = ({ investment, onSuccess, onCancel }) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(investment?.name || "");
  const [initialAmount, setInitialAmount] = useState(investment?.initialAmount || "");
  const [currentAmount, setCurrentAmount] = useState(investment?.currentAmount || "");
  const [annualYield, setAnnualYield] = useState(investment?.annualYield || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (investment) {
      setName(investment.name || "");
      setInitialAmount(investment.initialAmount || "");
      setCurrentAmount(investment.currentAmount || "");
      setAnnualYield(investment.annualYield || "");
    }
  }, [investment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (investment) {
        await updateInvestment(householdId, investment.id, {
          name: name.trim(),
          initialAmount: Number(initialAmount),
          currentAmount: Number(currentAmount),
          annualYield: Number(annualYield)
        });
      } else {
        await createInvestment(householdId, {
          name: name.trim(),
          initialAmount: Number(initialAmount),
          currentAmount: Number(currentAmount),
          annualYield: Number(annualYield)
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Erro ao salvar investimento: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h3>{investment ? "Editar Investimento" : "Novo Investimento"}</h3>
      <input
        type="text"
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Valor Inicial"
        value={initialAmount}
        onChange={e => setInitialAmount(e.target.value)}
        required
        min="0"
      />
      <input
        type="number"
        placeholder="Valor Atual"
        value={currentAmount}
        onChange={e => setCurrentAmount(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Rentabilidade Anual %"
        value={annualYield}
        onChange={e => setAnnualYield(e.target.value)}
        min="0"
        step="0.01"
      />
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Salvando..." : (investment ? "Salvar Alterações" : "Adicionar Investimento")}
      </button>
      {onCancel && (
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  );
};

export default InvestmentForm;
