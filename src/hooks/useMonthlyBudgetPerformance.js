// src/hooks/useMonthlyBudgetPerformance.js

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    getDocs,       // NOVO: Para buscar síncrono para o Rollover
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';
import useAnnualData from './useAnnualData'; 
import useCategories from './useCategories'; 
import useTypes from './useTypes'; // NOVO: Para verificar se a categoria é Receita
import { displayNotification } from '../utils/notification';

/**
 * Hook para consolidar a performance orçamentária mensal (Meta Base, Rollover, Gasto Real).
 */
const useMonthlyBudgetPerformance = (yearMonth) => {
    const { householdId } = useHousehold();
    const { categories } = useCategories();
    const { types } = useTypes(); // Lista de Tipos para verificar isIncome
    
    // Assumimos que o useAnnualData recebe o ano (ex: 2025)
    const { annualData, loading: annualLoading } = useAnnualData(yearMonth ? yearMonth.substring(0, 4) : null);
    
    const [performance, setPerformance] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!householdId || !yearMonth || annualLoading || categories.length === 0 || types.length === 0) {
            setLoading(annualLoading || categories.length === 0 || types.length === 0);
            return;
        }

        // 1. QUERY para Transações do Mês
        const transactionsRef = collection(db, `households/${householdId}/transactions`);
        const qTransactions = query(
            transactionsRef,
            where('yearMonth', '==', yearMonth)
        );

        // 2. QUERY para Metas Mensais Ajustadas/Rollover
        const budgetsRef = collection(db, `households/${householdId}/monthlyBudgets`);
        const qBudgets = query(
            budgetsRef,
            where('yearMonth', '==', yearMonth)
        );

        let transactionsList = [];
        let budgetsList = [];
        let unsubscribeTransactions = () => {};
        let unsubscribeBudgets = () => {};

        // 3. Monitorar Transações e Metas Mensais
        unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
            transactionsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            recalculatePerformance();
        });

        unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
            budgetsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            recalculatePerformance();
        });


        // 4. Lógica Principal de Recálculo
        const recalculatePerformance = () => {
            const newPerformance = {};
            const realSpentByCategory = {};

            // A. Calcular Gasto Real (Despesas)
            transactionsList
                .filter(t => t.type === 'expense' && t.category?.id) // Apenas despesas com category.id
                .forEach(t => {
                    const catId = t.category.id;
                    const amount = t.amount || 0;
                    realSpentByCategory[catId] = (realSpentByCategory[catId] || 0) + amount;
                });

            // B. Consolidar Dados por Categoria
            let alertMessages = [];
            categories.forEach(category => {
                const catId = category.id;
                
                // 1. Meta Base (Anual / 12)
                const annualGoal = annualData[catId]?.goalAmount || 0;
                const monthlyBaseGoal = annualGoal / 12;
                
                // 2. Meta Mensal Ajustada/Rollover
                const monthlyBudgetDoc = budgetsList.find(b => b.categoryId === catId);
                const adjustedGoal = monthlyBudgetDoc?.goalAmount || monthlyBaseGoal;
                const rollover = monthlyBudgetDoc?.rollover || 0;
                
                // 3. Gasto Real
                const realSpent = realSpentByCategory[catId] || 0;

                // 4. Consolidação
                newPerformance[catId] = {
                    categoryId: catId,
                    categoryName: category.name,
                    typeId: category.typeId,
                    
                    // Metas
                    monthlyBaseGoal: monthlyBaseGoal,
                    adjustedGoal: adjustedGoal,
                    rollover: rollover,
                    totalAvailable: adjustedGoal + rollover,
                    
                    // Performance
                    realSpent: realSpent,
                    remaining: (adjustedGoal + rollover) - realSpent,
                    isOverBudget: realSpent > (adjustedGoal + rollover),
                    monthlyBudgetId: monthlyBudgetDoc?.id || null,
                };

                // 5. LÓGICA DE ALERTA DE ORÇAMENTO (NOVO CÓDIGO)
            const item = newPerformance[catId];
            
            // Só monitoramos categorias de DESPESA que têm uma meta (> 0)
            if (!item.type?.isIncome && item.totalGoal > 0) {
                const percentSpent = item.realSpent / item.totalGoal;
                const remainingPercent = item.remaining / item.totalGoal;

                // ⚠️ Alerta MÁXIMO: Gasto Excedido (> 100%)
                if (item.isOverBudget) { 
                    alertMessages.push(`⚠️ ${item.categoryName}: Limite de R$ ${item.totalGoal.toFixed(2)} ultrapassado em R$ ${Math.abs(item.remaining).toFixed(2)}.`);
                } 
                // 🟠 Alerta INTERMEDIÁRIO: Próximo ao Limite (entre 80% e 100%)
                else if (remainingPercent > 0 && remainingPercent < 0.2) {
                    alertMessages.push(`🟠 ${item.categoryName}: Restam apenas R$ ${item.remaining.toFixed(2)} (${(remainingPercent * 100).toFixed(0)}%).`);
                } 
                // 🟡 NOVO ALERTA: Meio do Orçamento (acima de 50% e não próximo ao limite)
                else if (percentSpent >= 0.50 && percentSpent < 0.85) { 
                     // O alerta só é emitido uma vez (e atualizado) para o 50%
                     alertMessages.push(`🟡 ${item.categoryName}: Você já gastou R$ ${item.realSpent.toFixed(2)}, atingindo ${(percentSpent * 100).toFixed(0)}% do limite de R$ ${item.totalGoal.toFixed(2)}.`);
                }
            }
        });

        // Dispara a notificação final se houver alertas
        if (alertMessages.length > 0) {
            const bodyMessage = alertMessages.join('\n');
            displayNotification('Alerta de Orçamento!', bodyMessage, {
                // Garante que a notificação se atualize
                tag: 'budget-alert', 
                renotify: true 
            });
        }

            setPerformance(newPerformance);
            setLoading(false);
        };

        // Limpeza dos listeners
        return () => {
            unsubscribeTransactions();
            unsubscribeBudgets();
        };

    }, [householdId, yearMonth, annualLoading, categories, annualData, types]); // Adicionado 'types' na dependência


    // Funções CRUD

    /**
     * Salva o ajuste da meta (se for diferente da base anual/12).
     */
    const saveGoalAdjustment = async (categoryId, newGoalAmount, monthlyBudgetId) => {
        const baseGoal = performance[categoryId]?.monthlyBaseGoal || 0;
        const finalAmount = parseFloat(newGoalAmount) || 0;
        
        if (finalAmount === baseGoal && !monthlyBudgetId) {
            return;
        }
        
        if (!householdId) {
            throw new Error("ID da família não encontrado.");
        }

        try {
            if (finalAmount === baseGoal && monthlyBudgetId) {
                // Remove o ajuste
                await deleteDoc(doc(db, `households/${householdId}/monthlyBudgets`, monthlyBudgetId));
            } else if (monthlyBudgetId) {
                // Atualiza o ajuste existente
                await updateDoc(doc(db, `households/${householdId}/monthlyBudgets`, monthlyBudgetId), {
                    goalAmount: finalAmount,
                });
            } else {
                // Cria novo ajuste
                await addDoc(collection(db, `households/${householdId}/monthlyBudgets`), {
                    categoryId: categoryId,
                    goalAmount: finalAmount,
                    householdId: householdId,
                    yearMonth: yearMonth,
                    rollover: 0, // Rollover será preenchido pelo fechamento de mês
                });
            }
        } catch (e) {
            console.error("Erro ao salvar ajuste de meta:", e);
            throw new Error("Falha ao salvar o ajuste.");
        }
    };

    /**
     * Calcula o saldo final do mês atual e o propaga como 'rollover' para o mês seguinte.
     */
    const closeMonthAndCalculateRollover = async () => {
        if (!householdId || !yearMonth || loading) {
            throw new Error("Dados incompletos para fechar o mês.");
        }

        // 1. Determinar o Mês Seguinte
        const currentYear = parseInt(yearMonth.substring(0, 4));
        const currentMonth = parseInt(yearMonth.substring(4));
        
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear = currentYear + 1;
        }
        
        const nextYearMonth = `${nextYear}${String(nextMonth).padStart(2, '0')}`;
        
        const savePromises = [];
        const budgetsRef = collection(db, `households/${householdId}/monthlyBudgets`);

        // 2. Loop por todas as categorias e calcular o saldo
        for (const catId in performance) {
            const item = performance[catId];
            const category = categories.find(c => c.id === catId);
            
            // Ignorar categorias de Receita (Assumindo que tipos de receita não têm rollover orçamentário)
            const type = types.find(t => t.id === category?.typeId);
            if (type?.isIncome) continue; 
            
            // Saldo para Rollover: (Meta + Rollover Anterior) - Gasto Real
            const rolloverAmount = item.remaining; 
            
            // Se o Rollover for zero, não precisamos escrever nada no próximo mês, 
            // pois a ausência do documento é o valor padrão.
            if (rolloverAmount === 0 && !item.monthlyBudgetId) continue;

            // 3. Preparar a escrita no Firestore para o MÊS SEGUINTE
            
            // Busca o documento do próximo mês para esta categoria
            const qNextBudget = query(
                budgetsRef,
                where('yearMonth', '==', nextYearMonth),
                where('categoryId', '==', catId)
            );
            
            const snapshot = await getDocs(qNextBudget);
            
            if (snapshot.docs.length > 0) {
                // UPDATE: Se o orçamento do mês seguinte já existe, atualizamos APENAS o rollover
                const nextBudgetId = snapshot.docs[0].id;
                
                savePromises.push(
                    updateDoc(doc(db, `households/${householdId}/monthlyBudgets`, nextBudgetId), {
                        rollover: rolloverAmount,
                    })
                );
            } else {
                // CREATE: Se o orçamento do mês seguinte não existe, criamos um novo
                savePromises.push(
                    addDoc(budgetsRef, {
                        categoryId: catId,
                        goalAmount: 0, // A meta será a média anual por padrão, salvo se ajustado
                        rollover: rolloverAmount,
                        householdId: householdId,
                        yearMonth: nextYearMonth,
                    })
                );
            }
        }

        try {
            await Promise.all(savePromises);
            alert(`Fechamento de mês ${yearMonth} concluído! Rollover propagado para ${nextYearMonth}.`);
            return true;
        } catch (e) {
            console.error("Erro ao fechar mês e salvar rollovers:", e);
            throw new Error("Falha ao propagar o Rollover.");
        }
    };


    return { 
        performance, 
        loading, 
        saveGoalAdjustment, 
        closeMonthAndCalculateRollover 
    };
};

export default useMonthlyBudgetPerformance;