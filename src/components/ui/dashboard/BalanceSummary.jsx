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
    const currentBalance = incomeEffective + expenseEffective;
    const projectedBalance = totalIncome + totalExpense;
    const availableBalance = currentBalance + availableFunds + projectedBalance;
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
                    Fundos iniciais:
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
                    <p>• Receitas recebidas: {formatCurrency(incomeEffective)}</p>
                    <p>• Receitas pendentes: {formatCurrency(incomePlanned)}</p>
                    <p>Total de Receitas: {formatCurrency(totalIncome)}</p>
                </div>
            </div>

            {/* Seção de Despesas */}
            <div>
                <h4>Despesas</h4>
                <div>
                    <p>• Despesas pagas: {formatCurrency(-expenseEffective)}</p>
                    <p>• Despesas pendentes: {formatCurrency(-expensePlanned)}</p>
                    <p >Total de Despesas: {formatCurrency(-totalExpense)}</p>
                </div>
            </div>

            {/* Seção de Saldos */}
            <div>
                <h4>Resumo</h4>
                <div>
                    <p>• Saldo atual: {formatCurrency(currentBalance)}</p>
                    <p>• Saldo futuro: {formatCurrency(projectedBalance)}</p>

                    <p>
                        FUNDOS DISPONÍVEIS: {formatCurrency(availableBalance)}</p>

                    {isAvailableNegative && (
                        <p> ⚠️ Atenção: Seus fundos disponíveis estão negativos!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceSummary;