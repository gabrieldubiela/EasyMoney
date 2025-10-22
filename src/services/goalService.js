// src/services/goalService.js

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Busca todas as metas de uma família.
 * @param {string} householdId
 * @returns {Promise<Array>}
 */
export const fetchAllGoals = async (householdId) => {
  const goalsRef = collection(db, `households/${householdId}/goals`);
  const snapshot = await getDocs(goalsRef);
  const goals = [];
  snapshot.forEach((doc) => goals.push({ id: doc.id, ...doc.data() }));
  return goals;
};

/**
 * Busca meta por ID.
 * @param {string} householdId
 * @param {string} goalId
 * @returns {Promise<Object>}
 */
export const fetchGoalById = async (householdId, goalId) => {
  const goalRef = doc(db, `households/${householdId}/goals`, goalId);
  const goalSnap = await getDoc(goalRef);
  if (goalSnap.exists()) return { id: goalSnap.id, ...goalSnap.data() };
  else throw new Error("Meta não encontrada.");
};

/**
 * Cria uma nova meta.
 * @param {string} householdId
 * @param {Object} data
 * @returns {Promise<void>}
 */
export const createGoal = async (householdId, data) => {
  if (!householdId || !data?.name) return;
  await addDoc(collection(db, `households/${householdId}/goals`), {
    name: data.name.trim(),
    startDate: data.startDate || new Date(),
    targetAmount: data.targetAmount || 0,
    targetDate: data.targetDate || null,
    progress: data.progress || 0,
    status: data.status || "active",
    expectedReturnRate: data.expectedReturnRate || 0,
    linkedInvestments: [],
    surplusAmount: 0,
  });
};

/**
 * Atualiza uma meta existente.
 * @param {string} householdId
 * @param {string} goalId
 * @param {Object} newData
 * @returns {Promise<void>}
 */
export const updateGoal = async (householdId, goalId, newData) => {
  await updateDoc(doc(db, `households/${householdId}/goals`, goalId), newData);
};

/**
 * Deleta uma meta.
 * @param {string} householdId
 * @param {string} goalId
 * @returns {Promise<void>}
 */
export const deleteGoal = async (householdId, goalId) => {
  await deleteDoc(doc(db, `households/${householdId}/goals`, goalId));
};
