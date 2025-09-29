// src/hooks/useFinancialSummary.js
export default function useFinancialSummary(effectiveTransactions = [], plannedTransactions = [], availableFunds = 0) {
    // Separar receitas e despesas efetivas
    const incomeEffective = effectiveTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseEffective = effectiveTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Separar receitas e despesas planejadas
    const incomePlanned = plannedTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expensePlanned = plannedTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Totais por categoria
    const totalIncome = incomeEffective + incomePlanned;
    const totalExpense = expenseEffective + expensePlanned;
    
    // Saldos calculados
    const currentBalance = incomeEffective - expenseEffective;
    const projectedBalance = totalIncome - totalExpense;
    const availableBalance = currentBalance + availableFunds;

    return {
        incomeEffective,
        expenseEffective,
        incomePlanned,
        expensePlanned,
        totalIncome,
        totalExpense,
        currentBalance,
        projectedBalance,
        availableBalance
    };
}
