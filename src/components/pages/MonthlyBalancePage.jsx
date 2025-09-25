// src/components/pages/MonthlyBalancePage.jsx (Refatorado)

import React, { useState } from 'react';
// IMPORTAÇÃO DOS NOVOS COMPONENTES
import useMonthlyBalance from '../../hooks/useMonthlyBalance'; 
import BalanceSummary from '../dashboard/BalanceSummary'; 

// Assumindo que você moveu estes para a nova estrutura de pastas
import PlannedExpenseForm from '../forms/PlannedExpenseForm'; 
import PlannedExpenseItem from '../items/PlannedExpenseItem'; 

const MonthlyBalancePage = () => {
    // 1. Gerenciamento do Período (Únicos estados que a Page controla)
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); 

    // 2. Uso do NOVO HOOK para toda a lógica de dados
    const {
        availableFunds, setAvailableFunds,
        plannedExpenses,
        totalEffective, totalPlanned,
        balance,
        categories, types,
        loading,
        refetch // Função para recarregar dados
    } = useMonthlyBalance(year, month);


    if (loading) return <div style={{ padding: '20px' }}>Carregando Balanço Mensal...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Balanço e Planejamento Mensal</h1>

            {/* Seleção de Período */}
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {/* ... (opções de mês) ... */}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ width: '80px', marginLeft: '10px' }}/>

            {/* Resumo do Balanço (Componente Isolado) */}
            <BalanceSummary 
                availableFunds={availableFunds}
                setAvailableFunds={setAvailableFunds}
                totalEffective={totalEffective}
                totalPlanned={totalPlanned}
                balance={balance}
            />

            {/* Adicionar Despesa Planejada (Componente Isolado) */}
            <div style={{ marginBottom: '30px', padding: '15px', border: '1px dashed #aaa' }}>
                <PlannedExpenseForm onSaveSuccess={refetch} />
            </div>

            {/* Lista de Despesas Planejadas */}
            <h2>Despesas Planejadas ({plannedExpenses.length})</h2>
            {plannedExpenses.length === 0 ? (
                <p>Nenhuma despesa planejada para este período.</p>
            ) : (
                plannedExpenses.map(expense => (
                    <PlannedExpenseItem
                        key={expense.id}
                        expense={expense}
                        categoryName={categories[expense.category_id] || 'N/A'}
                        typeName={types[expense.type_id] || 'N/A'}
                        onConvert={refetch} // Atualiza a lista após conversão
                    />
                ))
            )}
        </div>
    );
};

export default MonthlyBalancePage;