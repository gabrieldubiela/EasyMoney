// src/services/budgetService.js

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Salva ou atualiza um ajuste de meta orçamentária para um mês específico.
 */
export const saveGoalAdjustment = async ({ householdId, yearMonth, categoryId, newGoalAmount, monthlyBudgetId, baseGoal }) => {
  if (!householdId) {
    throw new Error("ID da família não encontrado.");
  }

  const finalAmount = parseFloat(newGoalAmount) || 0;

  // Se o valor ajustado for igual à meta base, o ajuste customizado é removido (se existir).
  if (finalAmount === baseGoal) {
    if (monthlyBudgetId) {
      await deleteDoc(doc(db, `households/${householdId}/monthlyBudgets`, monthlyBudgetId));
    }
    return; // Nenhuma outra ação é necessária.
  }

  // Se o valor for diferente, um ajuste é criado ou atualizado.
  if (monthlyBudgetId) {
    // Atualiza o ajuste existente
    await updateDoc(doc(db, `households/${householdId}/monthlyBudgets`, monthlyBudgetId), {
      goalAmount: finalAmount,
    });
  } else {
    // Cria um novo ajuste
    await addDoc(collection(db, `households/${householdId}/monthlyBudgets`), {
      categoryId,
      goalAmount: finalAmount,
      householdId,
      yearMonth,
      rollover: 0, // O rollover é sempre calculado pelo fechamento do mês anterior.
    });
  }
};

/**
 * Calcula o saldo final de cada categoria no mês atual e o propaga como 'rollover' para o mês seguinte.
 */
export const closeMonthAndCalculateRollover = async ({ householdId, yearMonth, performanceData, categories, types }) => {
  if (!householdId || !yearMonth || !performanceData) {
    throw new Error("Dados incompletos para fechar o mês.");
  }

  // 1. Determina o mês seguinte
  const currentYear = parseInt(yearMonth.substring(0, 4));
  const currentMonth = parseInt(yearMonth.substring(4));
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextYearMonth = `${nextYear}${String(nextMonth).padStart(2, '0')}`;

  const budgetsRef = collection(db, `households/${householdId}/monthlyBudgets`);
  const promises = [];

  // 2. Itera sobre a performance calculada para determinar o rollover
  for (const catId in performanceData) {
    const item = performanceData[catId];
    const category = categories.find(c => c.id === catId);
    const type = types.find(t => t.id === category?.typeId);

    // Ignora categorias de receita para o rollover orçamentário
    if (type?.isIncome) continue;

    // O 'remaining' já é o saldo final: (Meta + Rollover Anterior) - Gasto Real
    const rolloverAmount = item.remaining;
    if (rolloverAmount === 0 && !item.monthlyBudgetId) continue;

    // 3. Prepara a escrita no Firestore para o MÊS SEGUINTE
    const qNextBudget = query(
      budgetsRef,
      where('yearMonth', '==', nextYearMonth),
      where('categoryId', '==', catId)
    );

    const snapshot = await getDocs(qNextBudget);

    if (!snapshot.empty) {
      // UPDATE: Atualiza o documento do próximo mês se ele já existir
      const nextBudgetId = snapshot.docs[0].id;
      promises.push(
        updateDoc(doc(db, `households/${householdId}/monthlyBudgets`, nextBudgetId), {
          rollover: rolloverAmount,
        })
      );
    } else {
      // CREATE: Cria um novo documento para o próximo mês se não existir
      promises.push(
        addDoc(budgetsRef, {
          categoryId: catId,
          goalAmount: 0, // A meta base anual será usada por padrão, a menos que seja ajustada
          rollover: rolloverAmount,
          householdId,
          yearMonth: nextYearMonth,
        })
      );
    }
  }

  await Promise.all(promises);
};

/**
 * Cria um novo registro de orçamento anual para uma categoria.
 * Inclui validação para evitar duplicatas.
 */
export const createAnnualBudget = async ({ householdId, userId, category, year, annualEstimate }) => {
  const estimateValue = parseFloat(annualEstimate);

  // 1. Validação de entrada
  if (!householdId || !category || !year || isNaN(estimateValue) || estimateValue <= 0) {
    throw new Error("Por favor, selecione uma Categoria, um Ano e insira um Valor Estimado positivo.");
  }

  // 2. Verifica se o orçamento já existe para evitar duplicatas
  const budgetsRef = collection(db, `households/${householdId}/budgets`);
  const q = query(
    budgetsRef,
    where('category_id', '==', category),
    where('year', '==', parseInt(year))
  );

  const existingBudgets = await getDocs(q);
  if (!existingBudgets.empty) {
    throw new Error("Já existe um orçamento para esta Categoria e Ano. Por favor, edite o registro existente.");
  }

  // 3. Adiciona o novo orçamento
  await addDoc(budgetsRef, {
    category_id: category,
    year: parseInt(year), // Salva como número
    annual_estimate: estimateValue,
    user_id: userId,
  });
};