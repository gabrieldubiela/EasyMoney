// src/hooks/useDashboardData.js

import { useState, useMemo } from 'react';
import useAnnualData from './useAnnualData';
import useCombinedHouseholdData from './useCombinedHouseholdData';
import useMonthlyBalance from './useMonthlyBalance';
import useMonthlyPerformanceData from './useMonthlyPerformanceData';
import useScheduledPayments from './useScheduledPayments';
import useMonthClosingStatus from './useMonthClosingStatus';
import useFinancialSummary from './useFinancialSummary';

/**
 * Hook container que orquestra todos os dados necessários para o Dashboard.
 */
export default function useDashboardData() {
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentMonth = today.getMonth() + 1;
    const currentYearMonth = `${currentYear}${String(currentMonth).padStart(2, '0')}`;

    // 1. Estado local da UI que pertence ao dashboard
    const [availableFunds, setAvailableFunds] = useState(0);

    // 2. Hooks de dados base
    const { categories, types, categoryMap, loading: metadataLoading } = useCombinedHouseholdData();
    const { annualData, loading: annualLoading } = useAnnualData(currentYear);
    const { upcomingPayments, loading: paymentsLoading } = useScheduledPayments();
    const { needsClosing, loading: closingLoading } = useMonthClosingStatus();
    
    // 3. Hooks que dependem de outros dados
    const { balance, totalEffective, totalPlanned, effectiveTransactions, plannedTransactions, loading: balanceLoading } = useMonthlyBalance(currentYear, currentMonth, availableFunds);
    const { performance, loading: performanceLoading } = useMonthlyPerformanceData({ yearMonth: currentYearMonth, annualData, categories, types });

    // 4. Cálculos derivados (memoizados para performance) 
    const { criticalCategories } = useMemo(() => {
        // Categorias críticas
        const critical = Object.values(performance).filter(item => 
            item.isOverBudget || (item.totalAvailable > 0 && item.remaining / item.totalAvailable < 0.2)
        );

        return { criticalCategories: critical };
    }, [performance]);

    const isLoading = metadataLoading || annualLoading || paymentsLoading || closingLoading || balanceLoading || performanceLoading;

    return {
        // Estado e Setters
        availableFunds,
        setAvailableFunds,
        // Dados brutos e calculados
        balance,
        totalEffective,
        totalPlanned,
        upcomingPayments,
        needsClosing,
        criticalCategories,
        annualData,
        // Dados para passar para o serviço de fechamento de mês
        performanceDataForClosing: {
            performance,
            categories,
            types,
            yearMonth: currentYearMonth
        },
        // Status
        isLoading,
        categoryMap
    };
}
