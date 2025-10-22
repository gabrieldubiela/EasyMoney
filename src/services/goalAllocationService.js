// src/services/goalAllocationService.js

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Cria vínculo entre investimento e meta.
 * @param {string} householdId
 * @param {string} investmentId
 * @param {string} goalId
 * @param {number} percentage
 */
export const createGoalAllocation = async (householdId, investmentId, goalId, percentage) => {
  await addDoc(collection(db, `households/${householdId}/investmentAllocations`), {
    investmentId,
    goalId,
    percentage,
  });
};

/**
 * Atualiza vínculo existente.
 * @param {string} householdId
 * @param {string} allocationId
 * @param {Object} newData
 */
export const updateGoalAllocation = async (householdId, allocationId, newData) => {
  await updateDoc(doc(db, `households/${householdId}/investmentAllocations`, allocationId), newData);
};

/**
 * Remove vínculo de alocação.
 * @param {string} householdId
 * @param {string} allocationId
 */
export const deleteGoalAllocation = async (householdId, allocationId) => {
  await deleteDoc(doc(db, `households/${householdId}/investmentAllocations`, allocationId));
};

/**
 * Lista todas as alocações.
 * @param {string} householdId
 * @returns {Promise<Array>}
 */
export const fetchAllGoalAllocations = async (householdId) => {
  const snapshot = await getDocs(collection(db, `households/${householdId}/investmentAllocations`));
  const allocations = [];
  snapshot.forEach((doc) => allocations.push({ id: doc.id, ...doc.data() }));
  return allocations;
};
