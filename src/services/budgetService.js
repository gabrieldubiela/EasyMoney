// src/services/budgetService.js

import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/** Operações no banco de dados Firestore relacionadas aos orçamentos.
 * 
 */ 

// Função para buscar todos orçamentos
export const fetchAllBudgets = async (householdId) => {

async function addTypeToBudgetInAllCategories(typeId) {
  const householdIds = await fetchAllHouseholdIds();
  for (const householdId of householdIds) {
    const categories = await fetchAllBudgets(householdId);
    for (const cat of categories) {
      await updateBudget(householdId, cat.id, typeId, 0);
    }
  }
}

// Função para buscar orçamento por ID
export const fetchBudgetById = async (householdId, categoryId) => {
  try {
    const budgetRef = doc(db, `households/${householdId}/orcamentos`, categoryId);
    const budgetSnap = await getDoc(budgetRef);
    if (budgetSnap.exists()) {
      return { id: budgetSnap.id, ...budgetSnap.data() };
    } else {
      throw new Error("Orçamento não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    throw error;
  }
};

// Função para atualizar um orçamento
export const updateBudget = async (householdId, categoryId, typeId, newValue) => {
  if (!householdId || !categoryId || !typeId) return;
  try {
    const budgetRef = doc(db, `households/${householdId}/orcamentos`, categoryId);
    const budgetSnap = await getDoc(budgetRef);
    if (budgetSnap.exists()) {
      const budgetData = budgetSnap.data();
      const updatedTypes = {
        ...budgetData.types,
        [typeId]: { valor: newValue },
      };
      await updateDoc(budgetRef, { types: updatedTypes });
    } else {
      throw new Error("Orçamento não encontrado para atualização.");
    }
  } catch (e) {
    console.error("Erro ao atualizar orçamento:", e);
  }
};

async function addCategoryToBudget(householdId, categoryId) {
  const allTypeIds = await fetchAllTypeIds();
  const typesMap = {};
  allTypeIds.forEach(typeId => typesMap[typeId] = { valor: 0 });
  await setDoc(doc(db, 'households', householdId, 'orcamentos', categoryId), {
    types: typesMap
  });
}

async function deleteBudgetCategory(householdId, categoryId) {
  await deleteDoc(doc(db, 'households', householdId, 'orcamentos', categoryId));
}
