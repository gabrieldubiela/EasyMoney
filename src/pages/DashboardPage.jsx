// src/pages/DashboardPage.jsx

import React from 'react';
import BalanceSummary from '../components/ui/dashboard/BalanceSummary'; // Verifique o caminho
import useDashboardData from '../hooks/useDashboardData';
import { closeMonthAndCalculateRollover } from '../services/budgetService'; // Importa a ação do serviço
import { useHousehold } from '../hooks/useHousehold';

const formatCurrency = (value = 0) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DashboardPage = () => {
    const { householdId } = useHousehold();
    const {
        availableFunds,
        setAvailableFunds,
        balance,
        totalEffective,
        totalPlanned,
        upcomingPayments,
        needsClosing,
        criticalCategories,
        totalByType,
        annualData,
        performanceDataForClosing,
        isLoading,
        categoryMap
    } = useDashboardData();

    const handleCloseMonth = async () => {
        if (!needsClosing) return;
        if (window.confirm(`Tem certeza que deseja fechar o mês de ${needsClosing.monthName}? Esta ação calculará o rollover para o próximo mês.`)) {
            try {
                await closeMonthAndCalculateRollover({
                    householdId,
                    yearMonth: needsClosing.yearMonth,
                    performanceData: performanceDataForClosing.performance,
                    categories: performanceDataForClosing.categories,
                    types: performanceDataForClosing.types
                });
                alert("Mês fechado com sucesso!");
            } catch (error) {
                alert(`Erro ao fechar o mês: ${error.message}`);
            }
        }
    };

    if (isLoading) {
        return <div style={{ padding: '20px' }}>Carregando Dashboard...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Financeiro</h1>

            {/* Seção de Ações e Alertas */}
            <div style={{ border: '2px solid #ffc107', padding: '15px', marginBottom: '30px' }}>
                <h2>🔔 Ações e Alertas</h2>
                {needsClosing && (
                    <div>
                        <p>⚠️ **Mês para Fechar:** O mês de **{needsClosing.monthName}** precisa ser fechado!</p>
                        <button onClick={handleCloseMonth}>Fechar Mês</button>
                    </div>
                )}
                {/* Outros alertas (contas a pagar, categorias críticas) podem ser renderizados aqui */}
            </div>

            {/* Componente de Balanço agora recebe os dados do hook */}
            <BalanceSummary
                availableFunds={availableFunds}
                setAvailableFunds={setAvailableFunds}
                incomeEffective={receitasRecebidas}      // Receitas já recebidas
                incomePlanned={receitasARceber}          // Receitas a receber
                expenseEffective={despesasPagas}         // Despesas já pagas
                expensePlanned={despesasAPagar}          // Despesas a pagar
            />

            {/* Outras seções do Dashboard (Resumo Anual, etc.) */}
            <div style={{ marginTop: '30px' }}>
                <h3>Resumo Anual ({annualData?.summary.year})</h3>
                <p>Gasto Médio Mensal: {formatCurrency(annualData?.summary.avgMonthlySpent)}</p>
                {/* Renderize outros dados anuais conforme necessário */}
            </div>
        </div>
    );
};

export default DashboardPage;