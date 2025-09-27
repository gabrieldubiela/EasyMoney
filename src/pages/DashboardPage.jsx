// src/components/pages/DashboardPage.jsx (NOVO COMPONENTE)

import React, { useMemo } from 'react';
import useMonthlyBalance from '../hooks/useMonthlyBalance';
import useMonthlyBudgetPerformance from '../hooks/useMonthlyBudgetPerformance';
import useAnnualData from '../hooks/useAnnualData';
import useCategories from '../hooks/useCategories';
import useTypes from '../hooks/useTypes';
import useScheduledPayments from '../hooks/useScheduledPayments'; 
import useMonthClosingStatus from '../hooks/useMonthClosingStatus';

// Simples componente utilitário para formatar moedas
const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DashboardPage = () => {
    const today = new Date();
    const currentYear = today.getFullYear().toString();
    const currentYearMonth = `${currentYear}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const { categories: categoryList } = useCategories();
    const { types: typeList } = useTypes();
    
    // 1. DADOS MENSAIS
    // Assumimos que useMonthlyBalance pega o ano/mês automaticamente se não for passado
    const { 
        totalEffective, totalPlanned, 
        balance, 
        effectiveTransactions,
        loading: balanceLoading
    } = useMonthlyBalance(today.getFullYear(), today.getMonth() + 1); 

    // 2. DADOS DE PERFORMANCE E ALERTA
    const { 
        performance, 
        loading: performanceLoading, 
        closeMonthAndCalculateRollover 
    } = useMonthlyBudgetPerformance(currentYearMonth);
    const { upcomingPayments, loading: paymentsLoading } = useScheduledPayments();
    const { needsClosing, loading: closingLoading } = useMonthClosingStatus();
    
    // 3. DADOS ANUAIS
    const { annualData, loading: annualLoading } = useAnnualData(currentYear);

    // 4. MEMOIZAÇÃO DE DADOS CALCULADOS
    const { criticalCategories, totalByType } = useMemo(() => {
        // Encontra as categorias com alerta (80%, 100%)
        const critical = Object.values(performance).filter(item => item.isOverBudget || item.remaining / item.totalGoal < 0.2);
        
        // Gasto Efetivo Total por tipo (Fixo/Variável/Receita)
        const byType = effectiveTransactions.reduce((acc, transaction) => {
            const typeId = transaction.type_id;
            const type = typeList.find(t => t.id === typeId);
            const typeName = type ? type.name : 'Outros';
            
            // O sinal da transação já está correto (receita +, despesa -)
            acc[typeName] = (acc[typeName] || 0) + transaction.amount;
            return acc;
        }, {});

        return { criticalCategories: critical, totalByType: byType };
    }, [performance, effectiveTransactions, typeList]);

    // MAPEAR NOMES
    const getCategoryName = (id) => (categoryList.find(c => c.id === id) || {}).name || 'N/A';
    
    // ----------------------------------------------------
    // COMPONENTE PRINCIPAL
    // ----------------------------------------------------

    if (balanceLoading || performanceLoading || paymentsLoading || annualLoading || closingLoading) {
        return <div style={{ padding: '20px' }}>Carregando Dashboard...</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard Financeiro</h1>
            
            <p style={{ color: '#6c757d', marginBottom: '30px' }}>Visão de tendências e ações urgentes para o período.</p>
            
            {/* ---------------------------------------------------- */}
            {/* SEÇÃO 2. AÇÕES E ALERTAS (TOPO) */}
            {/* ---------------------------------------------------- */}
            <div style={{ border: '2px solid #ffc107', padding: '15px', borderRadius: '5px', marginBottom: '30px', backgroundColor: '#fffbe6' }}>
                <h2>🔔 Ações e Alertas Urgentes</h2>
                
                {/* Alerta de Fechamento de Mês */}
                {needsClosing && (
                    <div style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                        <p>
                            ⚠️ **Mês para Fechar:** O mês de **{needsClosing.monthName}** precisa ser fechado!
                            {needsClosing.hasData ? " O Rollover precisa ser calculado." : " (Primeiro fechamento)."}
                        </p>
                        <button 
                            onClick={() => {
                                // O hook useMonthlyBudgetPerformance deve ter a função closeMonthAndCalculateRollover
                                // Mas ele foi chamado com o currentYearMonth. Precisamos passá-lo ao mês anterior.
                                // Para simplicidade, assumimos que o botão redireciona para a página de Fechamento.
                                alert(`Redirecionando para a página de Fechamento de Mês (${needsClosing.yearMonth})`);
                                // Implementação real: history.push('/monthly-budget-form', { monthToClose: needsClosing.yearMonth })
                            }}
                            style={{ background: 'white', color: '#dc3545', border: 'none', padding: '5px 10px', cursor: 'pointer', marginTop: '5px' }}
                        >
                            Ir para Fechamento
                        </button>
                    </div>
                )}

                {/* Contas a Pagar (Hoje/Amanhã) */}
                {upcomingPayments.length > 0 && (
                    <div style={{ border: '1px solid #17a2b8', padding: '10px', marginBottom: '15px' }}>
                        <p>
                            **Próximas Contas a Pagar ({upcomingPayments.length}):**
                        </p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                            {upcomingPayments.map(p => (
                                <li key={p.id}>
                                    {p.description} ({formatCurrency(p.amount)}) - Vencimento: {new Date(p.paymentDate.toDate()).toLocaleDateString('pt-BR')}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Categorias Críticas */}
                {criticalCategories.length > 0 && (
                    <div style={{ border: '1px solid #dc3545', padding: '10px', marginBottom: '15px', backgroundColor: '#f8d7da' }}>
                        <p>
                            **Categorias Críticas ({criticalCategories.length}):**
                        </p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#721c24' }}>
                            {criticalCategories.map(c => (
                                <li key={c.categoryId}>
                                    **{c.categoryName}**: {c.isOverBudget ? 'Limite EXCEDIDO!' : `Resta apenas ${formatCurrency(c.remaining)}.`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Sem Alertas */}
                {!needsClosing && upcomingPayments.length === 0 && criticalCategories.length === 0 && (
                    <p style={{ color: '#28a745' }}>✅ Sua situação está estável. Sem alertas urgentes.</p>
                )}

            </div>


            {/* ---------------------------------------------------- */}
            {/* SEÇÃO 1. RESUMO MENSAL (Visão Geral - Foco no Mês Atual) */}
            {/* ---------------------------------------------------- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ padding: '15px', border: '1px solid #333', backgroundColor: '#e9ecef' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>SALDO PROJETADO</p>
                    <h3 style={{ color: balance < 0 ? 'red' : 'green' }}>{formatCurrency(balance)}</h3>
                </div>
                <div style={{ padding: '15px', border: '1px solid #333' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>GASTO EFETIVO TOTAL</p>
                    <h3>{formatCurrency(Math.abs(totalEffective))}</h3>
                </div>
                <div style={{ padding: '15px', border: '1px solid #333' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>CONTAS A PAGAR (Planejadas)</p>
                    <h3>{formatCurrency(totalPlanned)}</h3>
                </div>
                <div style={{ padding: '15px', border: '1px solid #333' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>Gasto vs. Meta (Mês)</p>
                    {/* Exibe a média de performance de Despesas */}
                    {Object.values(performance).some(p => !p.type?.isIncome && p.totalGoal > 0) ? (
                        <h3 style={{ color: criticalCategories.length > 0 ? 'red' : 'inherit' }}>
                             {((Object.values(performance)
                                .filter(p => !p.type?.isIncome && p.totalGoal > 0)
                                .reduce((sum, p) => sum + p.realSpent / p.totalGoal, 0) / 
                                Object.values(performance).filter(p => !p.type?.isIncome && p.totalGoal > 0).length) * 100).toFixed(0)}%
                        </h3>
                    ) : (
                        <h3>N/A</h3>
                    )}
                </div>
            </div>

            {/* Gasto Efetivo Total por Tipo (Fixo/Variável) */}
            <div style={{ marginBottom: '30px' }}>
                <h3>Gasto Efetivo Total por Tipo</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {Object.entries(totalByType).map(([typeName, total]) => (
                        <li key={typeName} style={{ padding: '5px 0', borderBottom: '1px dotted #ccc' }}>
                            **{typeName}**: {formatCurrency(Math.abs(total))}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* ---------------------------------------------------- */}
            {/* SEÇÃO 3. ANUAL (Visão de Longo Prazo) */}
            {/* ---------------------------------------------------- */}
            <h3>📊 Resumo de Performance Anual ({currentYear})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px', textAlign: 'center' }}>
                <div style={{ padding: '15px', border: '1px solid #333' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>GASTO MÉDIO MENSAL (Até {today.toLocaleDateString('pt-BR', { month: 'short' })})</p>
                    <h3>{formatCurrency(annualData.summary.avgMonthlySpent)}</h3>
                </div>
                <div style={{ padding: '15px', border: '1px solid #333' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>RECEITA YTD</p>
                    <h3 style={{ color: 'green' }}>{formatCurrency(annualData.summary.totalRevenueYTD)}</h3>
                </div>
                <div style={{ padding: '15px', border: '1px solid #333' }}>
                    <p style={{ fontSize: '0.9em', margin: 0 }}>DESPESA YTD</p>
                    <h3 style={{ color: 'red' }}>{formatCurrency(Math.abs(annualData.summary.totalExpenseYTD))}</h3>
                </div>
            </div>

            {/* Alerta de Desvio Anual */}
            <div style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '5px' }}>
                <h4>Categorias Acima do Orçamento Esperado ({annualData.summary.monthsInPeriod} meses)</h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                    {Object.values(annualData.performanceByCategories)
                        .filter(item => item.isOverExpected) // Apenas Despesas que excederam 100% do pro-rata
                        .map(item => (
                            <li key={item.categoryId}>
                                **{getCategoryName(item.categoryId)}**: Gasto {((item.deviationPercent - 1) * 100).toFixed(0)}% acima do esperado (Gasto: {formatCurrency(Math.abs(item.spentYTD))} / Esperado: {formatCurrency(item.expectedYTD)}).
                            </li>
                        ))}
                    {Object.values(annualData.performanceByCategories).filter(item => item.isOverExpected).length === 0 && (
                        <li>Nenhuma categoria com despesa acumulada acima do esperado.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default DashboardPage;