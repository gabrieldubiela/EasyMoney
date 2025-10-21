// src/services/budgetService.js

import {
  collection,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Busca todas as categorias de orçamento de um orçamento anual
export const fetchAllBudgets = async (householdId, year) => {
  try {
    const categoriesRef = collection(db, `households/${householdId}/budgets/${year}/categories`);
    const snapshot = await getDocs(categoriesRef);
    const budgets = [];
    snapshot.forEach((doc) => {
      budgets.push({ id: doc.id, ...doc.data() });
    });
    return budgets;
  } catch (error) {
    console.error("Erro ao buscar categorias do orçamento:", error);
    throw error;
  }
};

// Busca orçamento de uma categoria específica
export const fetchBudgetCategory = async (householdId, year, categoryId) => {
  try {
    const budgetRef = doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId);
    const budgetSnap = await getDoc(budgetRef);
    if (budgetSnap.exists()) {
      return { id: budgetSnap.id, ...budgetSnap.data() };
    } else {
      throw new Error("Categoria de orçamento não encontrada.");
    }
  } catch (error) {
    console.error("Erro ao buscar categoria do orçamento:", error);
    throw error;
  }
};

// Atualiza/define o valor de um tipo na categoria do orçamento
export const updateBudgetCategoryTypeValue = async (householdId, year, categoryId, typeId, newValue) => {
  try {
    const budgetRef = doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId);
    const budgetSnap = await getDoc(budgetRef);
    if (budgetSnap.exists()) {
      const budgetData = budgetSnap.data();
      const updatedTypes = budgetData.types || {};
      updatedTypes[typeId] = { valor: newValue };
      await updateDoc(budgetRef, { types: updatedTypes });
    } else {
      throw new Error("Categoria de orçamento não encontrada para atualização.");
    }
  } catch (e) {
    console.error("Erro ao atualizar tipo na categoria do orçamento:", e);
    throw e;
  }
};

// Adiciona nova categoria ao orçamento anual, com todos os tipos existentes
export const addCategoryToBudget = async (householdId, year, categoryId, allTypeIds) => {
  try {
    const typesMap = {};
    allTypeIds.forEach(typeId => typesMap[typeId] = { valor: 0 });
    await setDoc(doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId), {
      types: typesMap
    });
  } catch (e) {
    console.error("Erro ao adicionar categoria ao orçamento:", e);
    throw e;
  }
};

// Remove categoria do orçamento anual
export const deleteBudgetCategory = async (householdId, year, categoryId) => {
  try {
    await deleteDoc(doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId));
  } catch (e) {
    console.error("Erro ao deletar categoria do orçamento:", e);
    throw e;
  }
};

// Adiciona novo tipo em todas categorias do orçamento do ano para o household
export const addTypeToBudgetInAllCategories = async (householdId, year, typeId) => {
  try {
    const categories = await fetchAllBudgets(householdId, year);
    for (const cat of categories) {
      await updateBudgetCategoryTypeValue(householdId, year, cat.id, typeId, 0);
    }
  } catch (e) {
    console.error("Erro ao adicionar novo tipo em todas categorias do orçamento:", e);
    throw e;
  }
};

// Remove tipo de todas categorias do orçamento anual do household
export const deleteTypeFromBudgetInAllCategories = async (householdId, year, typeId) => {
  try {
    const categories = await fetchAllBudgets(householdId, year);
    for (const cat of categories) {
      const budgetRef = doc(db, `households/${householdId}/budgets/${year}/categories`, cat.id);
      await updateDoc(budgetRef, {
        [`types.${typeId}`]: deleteField()
      });
    }
  } catch (e) {
    console.error("Erro ao remover tipo de todas categorias do orçamento:", e);
    throw e;
  }
};
