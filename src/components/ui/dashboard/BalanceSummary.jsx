// src/components/dashboard/BalanceSummary.jsx

import React from 'react';

const BalanceSummary = ({ availableFunds, setAvailableFunds, totalEffective, totalPlanned, balance }) => {
    
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const isNegative = balance < 0;

    return (
        <div style={{ margin: '20px 0', padding: '20px', border: '2px solid', borderColor: isNegative ? 'red' : 'green', fontWeight: 'bold' }}>
            
            {/* Gerenciamento de Fundos Disponíveis */}
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9' }}>
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
            <p>Total de Despesas Efetivas (Pagas): {formatCurrency(totalEffective)}</p>
            <p>Total de Despesas Planejadas (A Pagar): {formatCurrency(totalPlanned)}</p>
            <p>Fundos Disponíveis: {formatCurrency(availableFunds)}</p>
            <p style={{ color: isNegative ? 'red' : 'green', fontSize: '1.2em' }}>
                SALDO PROJETADO: {formatCurrency(balance)}
            </p>
        </div>
    );
};

export default BalanceSummary;