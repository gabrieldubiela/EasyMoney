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
        <div>

            {/* Campo de Fundos Iniciais */}
            <div>
                <label>
                    Fundos Disponíveis Iniciais:
                </label>
                <input
                    type="number"
                    value={availableFunds || 0}
                    onChange={handleFundsChange}
                    step="0.01"
                />
            </div>

            <h3>RESUMO FINANCEIRO</h3>

            {/* Seção de Receitas */}
            <div>
                <h4>Receitas</h4>
                <p>
                    Recebidas (efetivas): {formatCurrency(incomeEffective)}
                </p>
                <p>
                    A Receber (planejadas): {formatCurrency(incomePlanned)}
                </p>
                <p>
                    Total de Receitas: {formatCurrency(totalIncome)}
                </p>
            </div>

            {/* Seção de Despesas */}
            <div>
                <h4>Despesas</h4>
                <p>
                    Pagas (efetivas): {formatCurrency(Math.abs(expenseEffective))}
                </p>
                <p>
                    A Pagar (planejadas): {formatCurrency(Math.abs(expensePlanned))}
                </p>
                <p>
                    Total de Despesas: {formatCurrency(Math.abs(totalExpense))}
                </p>
            </div>

            {/* Seção de Saldos */}
            <div>
                <h4>Resumo de Saldos</h4>

                <p>
                    Saldo Atual (efetivo): {formatCurrency(currentBalance)}
                </p>

                <p>
                    Saldo Projetado (com planejados): {formatCurrency(projectedBalance)}
                </p>

                <p>
                    💰 FUNDOS DISPONÍVEIS: {formatCurrency(availableBalance)}
                </p>

                {isAvailableNegative && (
                    <p>
                        ⚠️ Atenção: Seus fundos disponíveis estão negativos!
                    </p>
                )}
            </div>
        </div>
    );
};

export default BalanceSummary;