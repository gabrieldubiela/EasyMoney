// src/services/budgetService.js

import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  deleteField
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Busca todas as categorias de orçamento para um ano.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @returns {Promise<Array>} Array de objetos categoria do orçamento.
 */
export const fetchAllBudgets = async (householdId, year) => {
  const categoriesRef = collection(db, `households/${householdId}/budgets/${year}/categories`);
  const snapshot = await getDocs(categoriesRef);
  const budgets = [];
  snapshot.forEach((doc) => {
    budgets.push({ id: doc.id, ...doc.data() });
  });
  return budgets;
};

/**
 * Busca orçamento de uma categoria.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @param {string} categoryId - O ID da categoria.
 * @returns {Promise<Object>} Objeto com dados da categoria no orçamento.
 */
export const fetchBudgetCategoryById = async (householdId, year, categoryId) => {
  const budgetRef = doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId);
  const budgetSnap = await getDoc(budgetRef);
  if (budgetSnap.exists()) {
    return { id: budgetSnap.id, ...budgetSnap.data() };
  } else {
    throw new Error("Categoria de orçamento não encontrada.");
  }
};

/**
 * Atualiza o valor de um tipo na categoria do orçamento.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @param {string} categoryId - O ID da categoria.
 * @param {string} typeId - O ID do tipo.
 * @param {number} newValue - Novo valor desse tipo para a categoria.
 * @returns {Promise<void>}
 */
export const updateBudgetCategoryTypeValue = async (householdId, year, categoryId, typeId, newValue) => {
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
};

/**
 * Adiciona nova categoria ao orçamento do ano.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @param {string} categoryId - O ID da categoria.
 * @param {Array<string>} allTypeIds - Array de IDs dos tipos existentes.
 * @returns {Promise<void>}
 */
export const createCategoryToBudget = async (householdId, year, categoryId, allTypeIds) => {
  const typesMap = {};
  allTypeIds.forEach(typeId => typesMap[typeId] = { valor: 0 });
  await setDoc(doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId), {
    types: typesMap
  });
};

/**
 * Remove categoria do orçamento.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @param {string} categoryId - O ID da categoria.
 * @returns {Promise<void>}
 */
export const deleteBudgetCategory = async (householdId, year, categoryId) => {
  await deleteDoc(doc(db, `households/${householdId}/budgets/${year}/categories`, categoryId));
};

/**
 * Adiciona novo tipo a todas categorias do orçamento do ano.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @param {string} typeId - O ID do novo tipo.
 * @returns {Promise<void>}
 */
export const addTypeToBudgetInAllCategories = async (householdId, year, typeId) => {
  const categories = await fetchAllBudgets(householdId, year);
  for (const cat of categories) {
    await updateBudgetCategoryTypeValue(householdId, year, cat.id, typeId, 0);
  }
};

/**
 * Remove tipo em todas categorias do orçamento anual.
 * @param {string} householdId - O ID da família.
 * @param {string|number} year - O ano do orçamento.
 * @param {string} typeId - O ID do tipo a ser removido.
 * @returns {Promise<void>}
 */
export const deleteTypeFromBudgetInAllCategories = async (householdId, year, typeId) => {
  const categories = await fetchAllBudgets(householdId, year);
  for (const cat of categories) {
    const budgetRef = doc(db, `households/${householdId}/budgets/${year}/categories`, cat.id);
    await updateDoc(budgetRef, {
      [`types.${typeId}`]: deleteField()
    });
  }
};
