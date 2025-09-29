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
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <label>
                    Fundos Disponíveis Iniciais:
                    <input
                        type="number"
                        value={availableFunds || 0}
                        onChange={handleFundsChange}
                        step="0.01"
                        style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
                    />
                </label>
            </div>

            {/* Seção de Receitas */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Receitas</h4>
                <div style={{ paddingLeft: '15px' }}>
                    <p>• Receitas Recebidas (efetivas): <strong style={{ color: '#22C55E' }}>{formatCurrency(incomeEffective)}</strong></p>
                    <p>• Receitas a Receber (planejadas): <strong style={{ color: '#6B7280' }}>{formatCurrency(incomePlanned)}</strong></p>
                    <p style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '8px' }}>
                        <strong>Total de Receitas: {formatCurrency(totalIncome)}</strong>
                    </p>
                </div>
            </div>

            {/* Seção de Despesas */}
            <div style={{ marginBottom: '20px' }}>
                <h4>Despesas</h4>
                <div style={{ paddingLeft: '15px' }}>
                    <p>• Despesas Pagas (efetivas): <strong style={{ color: '#DC2626' }}>{formatCurrency(expenseEffective)}</strong></p>
                    <p>• Despesas a Pagar (planejadas): <strong style={{ color: '#6B7280' }}>{formatCurrency(expensePlanned)}</strong></p>
                    <p style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '8px' }}>
                        <strong>Total de Despesas: {formatCurrency(totalExpense)}</strong>
                    </p>
                </div>
            </div>

            {/* Seção de Saldos */}
            <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
                <h4>Resumo</h4>
                <div style={{ paddingLeft: '15px' }}>
                    <p>• Saldo Atual (receitas recebidas - despesas pagas): 
                        <strong style={{ color: isCurrentNegative ? '#DC2626' : '#22C55E', marginLeft: '10px' }}>
                            {formatCurrency(currentBalance)}
                        </strong>
                    </p>

                    <p>• Saldo Projetado (incluindo valores planejados): 
                        <strong style={{ color: isProjectedNegative ? '#DC2626' : '#22C55E', marginLeft: '10px' }}>
                            {formatCurrency(projectedBalance)}
                        </strong>
                    </p>

                    <p style={{ borderTop: '2px solid #31afb4', paddingTop: '12px', marginTop: '12px', fontSize: '1.1em' }}>
                        💰 <strong>FUNDOS DISPONÍVEIS: 
                            <span style={{ color: isAvailableNegative ? '#DC2626' : '#31afb4', marginLeft: '10px' }}>
                                {formatCurrency(availableBalance)}
                            </span>
                        </strong>
                    </p>

                    {isAvailableNegative && (
                        <p style={{ color: '#DC2626', fontWeight: 'bold', marginTop: '10px' }}>
                            ⚠️ Atenção: Seus fundos disponíveis estão negativos!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceSummary;