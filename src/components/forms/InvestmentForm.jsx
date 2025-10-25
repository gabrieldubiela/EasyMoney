// src/components/forms/InvestmentForm.jsx

import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/useAppContext";
import { createInvestment, updateInvestment } from "../../services/investmentService";
import "../../styles/forms.css";
import "../../styles/buttons.css";

const InvestmentForm = ({ investment, onSuccess, onCancel }) => {
  const { householdId } = useAppContext();
  const [name, setName] = useState(investment?.name || "");
  const [initialAmount, setInitialAmount] = useState(investment?.initialAmount || "");
  const [currentAmount, setCurrentAmount] = useState(investment?.currentAmount || "");
  const [annualYield, setAnnualYield] = useState(investment?.annualYield || "");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
    setFormError("");
    if (!name.trim() || !initialAmount || !currentAmount) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }
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
      setFormError("Erro ao salvar investimento: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form investment-form" autoComplete="off">
      <h3>{investment ? "Editar Investimento" : "Novo Investimento"}</h3>

      <div className="form-group">
        <label className="form-label required" htmlFor="investment-name">
          Nome
        </label>
        <input
          id="investment-name"
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={isSaving}
      />
      </div>

      <div className="form-group">
        <label className="form-label required" htmlFor="investment-initial">
          Valor Inicial
        </label>
        <input
          id="investment-initial"
          type="number"
          placeholder="Valor Inicial"
          value={initialAmount}
          onChange={e => setInitialAmount(e.target.value)}
          required
          min="0"
          disabled={isSaving}
      />
      </div>

      <div className="form-group">
        <label className="form-label required" htmlFor="investment-current">
          Valor Atual
        </label>
        <input
          id="investment-current"
          type="number"
          placeholder="Valor Atual"
          value={currentAmount}
          onChange={e => setCurrentAmount(e.target.value)}
          required
          min="0"
          disabled={isSaving}
      />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="investment-yield">
          Rentabilidade Anual (%)
        </label>
        <input
          id="investment-yield"
          type="number"
          placeholder="Rentabilidade Anual (%)"
          value={annualYield}
          onChange={e => setAnnualYield(e.target.value)}
          min="0"
          step="0.01"
          disabled={isSaving}
      />
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : (investment ? "Salvar Alterações" : "Adicionar Investimento")}
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

export default InvestmentForm;
