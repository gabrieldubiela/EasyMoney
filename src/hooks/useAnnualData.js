// src/hooks/useAnnualData.js (VERSÃO FINAL)

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { useHousehold } from '../hooks/useHousehold';

// Define a estrutura padrão de dados para cada categoria/mês
const INITIAL_CATEGORY_DATA = {
    budgeted: 0, // Orçamento Anual (Meta)
    monthlyActuals: Array(12).fill(0) // 12 posições para o valor real gasto/recebido em cada mês
};

/**
 * Hook personalizado para buscar e consolidar dados de orçamento e transações reais
 * para um determinado ano, calculando as métricas anuais (YTD e Desvio).
 * @param {string} selectedYear O ano para o qual os dados devem ser carregados (Ex: '2025').
 */
const useAnnualData = (selectedYear) => {
    const { householdId } = useHousehold();
    // A estrutura de annualData foi alterada para incluir o resumo e a performance
    const [annualData, setAnnualData] = useState({ 
        summary: {}, 
        performanceByCategories: {}, 
        rawAnnualData: {} 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!householdId || !selectedYear) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const budgetsRef = collection(db, `households/${householdId}/budgets`);
                const transactionsRef = collection(db, `households/${householdId}/transactions`);

                // 1. Fetch Orçamentos Anuais (Coleção 'budgets')
                const budgetQuery = query(
                    budgetsRef,
                    where('year', '==', parseInt(selectedYear))
                );
                const budgetSnapshot = await getDocs(budgetQuery);
                const budgetsMap = {}; 
                
                budgetSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const categoryId = data.category_id;
                    budgetsMap[categoryId] = {
                        ...INITIAL_CATEGORY_DATA,
                        budgeted: data.annual_estimate || 0,
                    };
                });

                // 2. Fetch Transações Reais (Coleção 'transactions')
                const startYearMonth = selectedYear + '01';
                const endYearMonth = selectedYear + '12';

                const transactionsQuery = query(
                    transactionsRef,
                    where('yearMonth', '>=', startYearMonth),
                    where('yearMonth', '<=', endYearMonth)
                );
                const transactionsSnapshot = await getDocs(transactionsQuery);

                // 3. Consolidar Transações com Orçamentos
                transactionsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const categoryId = data.category_id;
                    // Montante já com sinal (Receita: +, Despesa: -)
                    const amount = data.amount; 
                    
                    const monthString = data.yearMonth.substring(4, 6);
                    const monthIndex = parseInt(monthString, 10) - 1;

                    if (!budgetsMap[categoryId]) {
                        budgetsMap[categoryId] = { ...INITIAL_CATEGORY_DATA, budgeted: 0 };
                    }
                    
                    budgetsMap[categoryId].monthlyActuals[monthIndex] += amount;
                });
                
                // ------------------ 4. CÁLCULO DE MÉTRICAS E SUMÁRIO ANUAL ------------------
                const currentYear = new Date().getFullYear().toString();
                // O mês atual (1 a 12)
                const currentMonth = new Date().getMonth() + 1; 
                
                // Limita o cálculo (Year-To-Date - YTD)
                const monthsInPeriod = selectedYear === currentYear ? currentMonth : 12;

                const annualSummary = {
                    totalRevenueYTD: 0,
                    totalExpenseYTD: 0, // Será um valor negativo ou zero
                    categoriesPerformance: {}, 
                };

                for (const catId in budgetsMap) {
                    const data = budgetsMap[catId];
                    
                    // 1. Gasto Acumulado (YTD Spent) - Receitas são positivas, Despesas negativas
                    const monthlyActualsYTD = data.monthlyActuals.slice(0, monthsInPeriod);
                    const spentYTD = monthlyActualsYTD.reduce((sum, amount) => sum + amount, 0); 
                    
                    // 2. Orçamento Esperado Acumulado (YTD Expected)
                    // Orçamento Anual / 12 * Meses passados
                    const expectedYTD = data.budgeted > 0 ? (data.budgeted / 12) * monthsInPeriod : 0;
                    
                    // 3. Desvio Anual (%)
                    let deviationPercent = 0;
                    if (expectedYTD > 0 && spentYTD < 0) {
                        // Compara gasto real (Absoluto) vs. esperado. 1.0 = 100% no alvo.
                        deviationPercent = Math.abs(spentYTD) / expectedYTD;
                    }
                    
                    // 4. Acumular Totais (Receita / Despesa)
                    if (spentYTD > 0) { 
                        annualSummary.totalRevenueYTD += spentYTD;
                    } else { 
                        annualSummary.totalExpenseYTD += spentYTD; 
                    }

                    // 5. Estrutura de Retorno Detalhada por Categoria
                    annualSummary.categoriesPerformance[catId] = {
                        categoryId: catId,
                        spentYTD: spentYTD,
                        expectedYTD: expectedYTD,
                        deviationPercent: deviationPercent,
                        // True se o gasto (Despesa) for maior que o esperado para o período.
                        isOverExpected: spentYTD < 0 && deviationPercent > 1, 
                        monthlyActuals: data.monthlyActuals, 
                        budgetedAnnual: data.budgeted,
                    };
                }

                const consolidatedData = {
                    summary: {
                        totalRevenueYTD: annualSummary.totalRevenueYTD,
                        totalExpenseYTD: annualSummary.totalExpenseYTD,
                        netBalanceYTD: annualSummary.totalRevenueYTD + annualSummary.totalExpenseYTD,
                        monthsInPeriod: monthsInPeriod,
                        // Gasto Médio Mensal (Total de Despesa / Meses)
                        avgMonthlySpent: monthsInPeriod > 0 ? Math.abs(annualSummary.totalExpenseYTD / monthsInPeriod) : 0, 
                    },
                    performanceByCategories: annualSummary.categoriesPerformance,
                    rawAnnualData: budgetsMap, 
                };

                setAnnualData(consolidatedData);

            } catch (err) {
                console.error("Erro ao buscar dados anuais:", err);
                setError("Falha ao carregar dados da planilha.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [householdId, selectedYear]); 

    // Retorna a nova estrutura
    return { annualData, loading, error };
};

export default useAnnualData;