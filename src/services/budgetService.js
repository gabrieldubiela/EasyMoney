// src/services/budgetService.js

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    getDocs,      
    addDoc, 
    doc, 
    updateDoc, 
    deleteDoc 
} from 'firebase/firestore';

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