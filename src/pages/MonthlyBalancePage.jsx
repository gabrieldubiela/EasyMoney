// src/pages/MonthlyBalancePage.jsx

import React, { useState } from 'react';
import useMonthlyBalance from '../hooks/useMonthlyBalance';
import BalanceSummary from '../components/ui/dashboard/BalanceSummary';
import TransactionForm from '../components/ui/forms/TransactionForm';
import PlannedTransactionItem from '../components/ui/items/PlannedTransactionItem';

const MonthlyBalancePage = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [availableFunds, setAvailableFunds] = useState(0);

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

    if (loading) return <div style={{ padding: '20px' }}>Carregando Balanço Mensal...</div>;

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'N/A';
    };

    const getTypeName = (typeId) => {
        const type = types.find(t => t.id === typeId);
        return type ? type.name : 'N/A';
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Balanço e Planejamento Mensal</h1>

            {/* Seleção de Período */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px' }}>Mês: </label>
                <select 
                    value={month} 
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    style={{ marginRight: '20px', padding: '5px' }}
                >
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
                
                <label style={{ marginRight: '10px' }}>Ano: </label>
                <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    style={{ width: '80px', padding: '5px' }}
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

            {/* Formulário Unificado - Modo Planejado */}
            <div>
                <h3>Adicionar Transação Planejada</h3>
                <TransactionForm 
                    isPlanned={true} 
                    onSaveSuccess={refetch}
                    transactionId={null}
                />
            </div>

            {/* Lista de Transações Planejadas */}
            <div>
                <h2>Transações Planejadas ({plannedTransactions.length})</h2>
                {plannedTransactions.length === 0 ? (
                    <p>Nenhuma transação planejada para este período.</p>
                ) : (
                    <div>
                        {plannedTransactions.map(transaction => (
                            <PlannedTransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                categoryName={getCategoryName(transaction.category_id)}
                                typeName={getTypeName(transaction.type_id)}
                                onConvert={refetch}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyBalancePage;