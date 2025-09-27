// src/pages/MonthlyBalancePage.jsx (Refatorado)

import React, { useState } from 'react';
// IMPORTAÇÃO DOS NOVOS COMPONENTES
import useMonthlyBalance from '../hooks/useMonthlyBalance'; 
import BalanceSummary from '../components/ui/dashboard/BalanceSummary'; 

// Assumindo que você moveu estes para a nova estrutura de pastas
import PlannedTransactionForm from '../components/ui/forms/PlannedTransactionForm'; 
import PlannedTransactionItem from '../components/ui/items/PlannedTransactionItem'; 

const MonthlyBalancePage = () => {
    // 1. Gerenciamento do Período (Únicos estados que a Page controla)
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); 

    // 2. Uso do NOVO HOOK para toda a lógica de dados
    const {
        availableFunds, setAvailableFunds,
        plannedTransactions,
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
                <option value={1}>Janeiro</option>
                <option value={2}>Fevereiro</option>
                <option value={3}>Março</option>
                <option value={4}>Abril</option>
                <option value={5}>Maio</option>
                <option value={6}>Junho</option>
                <option value={7}>Julho</option>
                <option value={8}>Agosto</option>
                <option value={9}>Setembro</option>
                <option value={10}>Outubro</option>
                <option value={11}>Novembro</option>
                <option value={12}>Dezembro</option>
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
                <PlannedTransactionForm onSaveSuccess={refetch} />
            </div>

            {/* Lista de Despesas Planejadas */}
            <h2>Despesas Planejadas ({plannedTransactions.length})</h2>
            {plannedTransactions.length === 0 ? (
                <p>Nenhuma despesa planejada para este período.</p>
            ) : (
                plannedTransactions.map(transaction => (
                    <PlannedTransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        categoryName={categories[transaction.category_id] || 'N/A'}
                        typeName={types[transaction.type_id] || 'N/A'}
                        onConvert={refetch} // Atualiza a lista após conversão
                    />
                ))
            )}
        </div>
    );
};

export default MonthlyBalancePage;