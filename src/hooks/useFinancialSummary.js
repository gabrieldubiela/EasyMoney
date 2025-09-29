// src/hooks/useFinancialSummary.js
export default function useFinancialSummary(effectiveTransactions = [], plannedTransactions = [], availableFunds = 0) {
    const incomeEffective = effectiveTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expenseEffective = effectiveTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const incomePlanned = plannedTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expensePlanned = plannedTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = incomeEffective + incomePlanned;
    const totalExpense = expenseEffective + expensePlanned;
    const currentBalance = incomeEffective - Math.abs(expenseEffective);
    const projectedBalance = totalIncome - Math.abs(totalExpense);
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
