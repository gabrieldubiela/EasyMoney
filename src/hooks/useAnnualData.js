// src/hooks/useAnnualData.js

import { useState, useEffect } from 'react';
// Importações necessárias para leitura, escrita (setDoc, addDoc) e data do Firebase
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useAppContext } from '../context/useAppContext';

// Define a estrutura padrão de dados para cada categoria/mês
const INITIAL_CATEGORY_DATA = {
    budgeted: 0, 
    monthlyActuals: Array(12).fill(0) 
};

const useAnnualData = (selectedYear) => {
    const { householdId } = useAppContext();
    // Gatilho para forçar a re-execução do useEffect após uma edição
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    
    const [annualData, setAnnualData] = useState({ 
        summary: {}, 
        performanceByCategories: {}, 
        rawAnnualData: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Garante que a busca só acontece se houver ID de usuário e um ano válido
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
                    // Usa parseInt(), conforme seu código original que funcionava
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
                        // Essencial: Armazena o ID do documento para a atualização
                        docId: doc.id, 
                    };
                });

                // 2. e 3. Fetch Transações e Consolidação
                const startYearMonth = selectedYear + '01';
                const endYearMonth = selectedYear + '12';

                const transactionsQuery = query(
                    transactionsRef,
                    where('yearMonth', '>=', startYearMonth),
                    where('yearMonth', '<=', endYearMonth)
                );
                const transactionsSnapshot = await getDocs(transactionsQuery);

                transactionsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const categoryId = data.category_id;
                    const amount = data.amount; 
                    
                    const monthString = data.yearMonth.substring(4, 6);
                    const monthIndex = parseInt(monthString, 10) - 1;

                    if (!budgetsMap[categoryId]) {
                        // Inicializa a linha para transações sem orçamento prévio
                        budgetsMap[categoryId] = { ...INITIAL_CATEGORY_DATA, budgeted: 0, docId: null };
                    }
                    
                    budgetsMap[categoryId].monthlyActuals[monthIndex] += amount;
                });
                
                // 4. CÁLCULO DE MÉTRICAS E SUMÁRIO ANUAL (Recriando a lógica que estava faltando)
                const currentYearStr = new Date().getFullYear().toString();
                const currentMonth = new Date().getMonth() + 1;
                const monthsInPeriod = selectedYear === currentYearStr ? currentMonth : 12;

                const annualSummary = {
                    totalRevenueYTD: 0,
                    totalExpenseYTD: 0,
                    categoriesPerformance: {}, 
                };

                for (const catId in budgetsMap) {
                    const data = budgetsMap[catId];
                    const monthlyActualsYTD = data.monthlyActuals.slice(0, monthsInPeriod);
                    const spentYTD = monthlyActualsYTD.reduce((sum, amount) => sum + amount, 0); 
                    const expectedYTD = data.budgeted > 0 ? (data.budgeted / 12) * monthsInPeriod : 0;
                    let deviationPercent = 0;
                    
                    if (spentYTD > 0) { 
                        annualSummary.totalRevenueYTD += spentYTD;
                    } else { 
                        annualSummary.totalExpenseYTD += spentYTD; 
                    }

                    if (expectedYTD > 0 && spentYTD < 0) {
                        deviationPercent = Math.abs(spentYTD) / expectedYTD;
                    }

                    annualSummary.categoriesPerformance[catId] = {
                        categoryId: catId,
                        spentYTD: spentYTD,
                        expectedYTD: expectedYTD,
                        deviationPercent: deviationPercent,
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
    }, [householdId, selectedYear, refreshTrigger]); 
    
    
    // 🛑 FUNÇÃO DE EDIÇÃO COM LÓGICA DE CRIAÇÃO/ATUALIZAÇÃO 🛑
    const updateAnnualGoal = async (categoryId, docId, newGoalAmount) => {
        if (!householdId) {
            console.error("HouseholdId ausente. Não é possível atualizar.");
            return;
        }

        const budgetsRef = collection(db, `households/${householdId}/budgets`);
        const amount = parseFloat(newGoalAmount) || 0; 
        const yearNumber = parseInt(selectedYear);
        
        try {
            if (docId) {
                // 1. ATUALIZAR documento existente (apenas o campo annual_estimate)
                console.log(`[FIREBASE] Tentando ATUALIZAR: ${docId}. Valor: ${amount}`);
                const budgetDocRef = doc(budgetsRef, docId);
                await setDoc(budgetDocRef, { annual_estimate: amount }, { merge: true });
                
            } else {
                // 2. CRIAR novo documento (se a categoria nunca foi orçada para este ano)
                console.log(`[FIREBASE] Tentando CRIAR novo orçamento para categoria: ${categoryId}. Valor: ${amount}`);
                await addDoc(budgetsRef, {
                    category_id: categoryId,
                    annual_estimate: amount,
                    year: yearNumber, // Salvo como Number
                    createdAt: serverTimestamp(),
                });
            }
            
            // Força o useEffect a rodar novamente para buscar os dados atualizados
            setRefreshTrigger(prev => prev + 1);

        } catch (e) {
            // Este log é crucial para identificar falhas de permissão/Regras do Firebase
            console.error("🛑 ERRO CRÍTICO no updateAnnualGoal:", e.message, e);
        }
    };

    return { annualData, loading, error, updateAnnualGoal };
};

export default useAnnualData;