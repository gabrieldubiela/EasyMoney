// src/components/ui/dashboard/BalanceSummary.jsx

import React from 'react';

const BalanceSummary = ({
    availableFunds,
    setAvailableFunds,
    incomeEffective = 0,      // Receitas recebidas
    incomePlanned = 0,        // Receitas a receber
    expenseEffective = 0,     // Despesas pagas
    expensePlanned = 0        // Despesas a pagar
}) => {

    const formatCurrency = (value = 0) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Cálculos
    const totalIncome = incomeEffective + incomePlanned;
    const totalExpense = expenseEffective + expensePlanned;
    const currentBalance = incomeEffective - expenseEffective; // Saldo atual (apenas efetivos)
    const projectedBalance = totalIncome - totalExpense; // Saldo projetado (com planejados)
    const availableBalance = currentBalance + availableFunds; // Fundos disponíveis

    const isCurrentNegative = currentBalance < 0;
    const isProjectedNegative = projectedBalance < 0;
    const isAvailableNegative = availableBalance < 0;

    // Função para atualizar fundos disponíveis
    const handleFundsChange = (e) => {
        const value = e.target.value;
        // Converte para número ou mantém 0 se vazio
        const numValue = value === '' ? 0 : parseFloat(value);
        if (!isNaN(numValue)) {
            setAvailableFunds(numValue);
        }
    };

    return (
        <div className="card">
            <h3>RESUMO FINANCEIRO</h3>

            {/* Campo de Fundos Iniciais */}
            <div>
                <label>
                    Fundos Disponíveis Iniciais:
                    <input
                        type="number"
                        value={availableFunds || 0}
                        onChange={handleFundsChange}
                        step="0.01"                        
                    />
                </label>
            </div>

            {/* Seção de Receitas */}
            <div>
                <h4>Receitas</h4>
                <div>
                    <p>• Receitas Recebidas (efetivas): {formatCurrency(incomeEffective)}</p>
                    <p>• Receitas a Receber (planejadas): {formatCurrency(incomePlanned)}</p>
                    <p>Total de Receitas: {formatCurrency(totalIncome)}</p>
                </div>
            </div>

            {/* Seção de Despesas */}
            <div>
                <h4>Despesas</h4>
                <div>
                    <p>• Despesas Pagas (efetivas): {formatCurrency(expenseEffective)}</p>
                    <p>• Despesas a Pagar (planejadas): {formatCurrency(expensePlanned)}</p>
                    <p >Total de Despesas: {formatCurrency(totalExpense)}</p>
                </div>
            </div>

            {/* Seção de Saldos */}
            <div>
                <h4>Resumo</h4>
                <div>
                    <p>• Saldo Atual (receitas recebidas - despesas pagas): {formatCurrency(currentBalance)}</p>

                    <p>• Saldo Projetado (incluindo valores planejados): {formatCurrency(projectedBalance)}</p>

                    <p>
                        💰 FUNDOS DISPONÍVEIS: {formatCurrency(availableBalance)}</p>

                    {isAvailableNegative && (
                        <p> ⚠️ Atenção: Seus fundos disponíveis estão negativos!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceSummary;