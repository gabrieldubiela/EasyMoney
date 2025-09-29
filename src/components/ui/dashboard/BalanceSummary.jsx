// src/components/ui/dashboard/BalanceSummary.jsx

import React from 'react';

const BalanceSummary = ({ availableFunds, setAvailableFunds, totalEffective, totalPlanned, balance }) => {
    
    const formatCurrency = (value = 0) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const isNegative = balance < 0;

    return (
        <div style={{ margin: '20px 0', padding: '20px', border: '2px solid', borderColor: isNegative ? 'red' : 'green' }}>
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Fundos Disponíveis Iniciais:
                    <input 
                        type="number" 
                        value={availableFunds} 
                        onChange={(e) => setAvailableFunds(parseFloat(e.target.value) || 0)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </label>
            </div>
            
            <h3>RESUMO PROJETADO</h3>
            <p>Receitas/Despesas Efetivas (Pagas): {formatCurrency(totalEffective)}</p>
            <p>Contas Planejadas (A Pagar/Receber): {formatCurrency(totalPlanned)}</p>
            <p style={{ color: isNegative ? 'red' : 'green', fontSize: '1.2em', fontWeight: 'bold' }}>
                SALDO PROJETADO: {formatCurrency(balance)}
            </p>
        </div>
    );
};

export default BalanceSummary;