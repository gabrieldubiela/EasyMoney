// src/pages/MonthlyBalancePage.jsx (Refatorado)

import React, { useState } from 'react';
import useMonthlyBalance from '../hooks/useMonthlyBalance';
import BalanceSummary from '../components/ui/dashboard/BalanceSummary';
import PlannedTransactionForm from '../components/ui/forms/PlannedTransactionForm';
import PlannedTransactionItem from '../components/ui/items/PlannedTransactionItem';

const MonthlyBalancePage = () => {
    // 1. Gerenciamento do Período (Únicos estados que a Page controla)
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);

    // 2. Uso do HOOK para toda a lógica de dados
    const {
        plannedTransactions,
        incomeEffective, expenseEffective, incomePlanned, expensePlanned,
        currentBalance, projectedBalance, availableBalance,
        categories, types,
        loading, refetch
    } = useMonthlyBalance(year, month, availableFunds);
    
    // Estado local para fundos disponíveis
    const [availableFunds, setAvailableFunds] = useState(0);

    if (loading) return <div >Carregando Balanço Mensal...</div>;

    return (
        <div >
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
            <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
            />

            {/* Resumo do Balanço (Componente Isolado) */}
            <BalanceSummary
                availableFunds={availableFunds}
                setAvailableFunds={setAvailableFunds}
                incomeEffective={incomeEffective}
                incomePlanned={incomePlanned}
                expenseEffective={expenseEffective}
                expensePlanned={expensePlanned}
            />

            {/* Adicionar Despesa Planejada (Componente Isolado) */}
            <div>
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
