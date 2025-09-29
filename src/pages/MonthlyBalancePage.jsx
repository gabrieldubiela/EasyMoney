// src/pages/MonthlyBalancePage.jsx (Refatorado e Corrigido)

import React, { useState } from 'react';
import useMonthlyBalance from '../hooks/useMonthlyBalance';
import BalanceSummary from '../components/ui/dashboard/BalanceSummary';
import PlannedTransactionForm from '../components/ui/forms/PlannedTransactionForm';
import PlannedTransactionItem from '../components/ui/items/PlannedTransactionItem';

const MonthlyBalancePage = () => {
    // 1. Estados locais PRIMEIRO (antes de usar nos hooks)
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [availableFunds, setAvailableFunds] = useState(0);

    // 2. Hook que usa os estados já declarados
    const {
        plannedTransactions,
        incomeEffective, 
        expenseEffective, 
        incomePlanned, 
        expensePlanned,
        categories, 
        types,
        loading, 
        refetch
    } = useMonthlyBalance(year, month, availableFunds);

    if (loading) return <div>Carregando Balanço Mensal...</div>;

    // Função auxiliar para mapear nomes
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'N/A';
    };

    const getTypeName = (typeId) => {
        const type = types.find(t => t.id === typeId);
        return type ? type.name : 'N/A';
    };

    return (
        <div>
            <h1>Balanço e Planejamento Mensal</h1>

            {/* Seleção de Período */}
            <div>
                <label>Mês: </label>
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
                
                <label>Ano: </label>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                />
            </div>

            {/* Resumo do Balanço */}
            <BalanceSummary
                availableFunds={availableFunds}
                setAvailableFunds={setAvailableFunds}
                incomeEffective={incomeEffective}
                incomePlanned={incomePlanned}
                expenseEffective={expenseEffective}
                expensePlanned={expensePlanned}
            />

            {/* Adicionar Despesa Planejada */}
            <div>
                <PlannedTransactionForm onSaveSuccess={refetch} />
            </div>

            {/* Lista de Despesas Planejadas */}
            <div>
                <h2>Despesas Planejadas ({plannedTransactions.length})</h2>
                {plannedTransactions.length === 0 ? (
                    <p>Nenhuma despesa planejada para este período.</p>
                ) : (
                    plannedTransactions.map(transaction => (
                        <PlannedTransactionItem
                            key={transaction.id}
                            transaction={transaction}
                            categoryName={getCategoryName(transaction.category_id)}
                            typeName={getTypeName(transaction.type_id)}
                            onConvert={refetch}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MonthlyBalancePage;