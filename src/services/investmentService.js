// src/services/investmentService.js

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Busca todos os investimentos de uma família.
 * @param {string} householdId - O ID da família.
 * @returns {Promise<Array>} Array de investimentos.
 */
export const fetchAllInvestments = async (householdId) => {
  const investmentsRef = collection(db, `households/${householdId}/investments`);
  const snapshot = await getDocs(investmentsRef);
  const investments = [];
  snapshot.forEach((doc) => investments.push({ id: doc.id, ...doc.data() }));
  return investments;
};

/**
 * Busca um investimento pelo ID.
 * @param {string} householdId - O ID da família.
 * @param {string} investmentId - O ID do investimento.
 * @returns {Promise<Object>} Documento do investimento.
 */
export const fetchInvestmentById = async (householdId, investmentId) => {
  const ref = doc(db, `households/${householdId}/investments`, investmentId);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return { id: snapshot.id, ...snapshot.data() };
  else throw new Error("Investimento não encontrado.");
};

/**
 * Cria um novo investimento.
 * @param {string} householdId - ID da família.
 * @param {Object} data - Dados do investimento.
 * @returns {Promise<void>}
 */
export const createInvestment = async (householdId, data) => {
  if (!householdId || !data?.name) return;
  await addDoc(collection(db, `households/${householdId}/investments`), {
    name: data.name.trim(),
    initialAmount: data.initialAmount || 0,
    currentAmount: data.currentAmount || data.initialAmount || 0,
    startDate: data.startDate || new Date(),
    annualYield: data.annualYield || 0,
    allocations: {},
  });
};

/**
 * Atualiza um investimento existente.
 * @param {string} householdId
 * @param {string} investmentId
 * @param {Object} newData
 * @returns {Promise<void>}
 */
export const updateInvestment = async (householdId, investmentId, newData) => {
  if (!householdId || !investmentId) return;
  await updateDoc(doc(db, `households/${householdId}/investments`, investmentId), newData);
};

/**
 * Deleta um investimento.
 * @param {string} householdId
 * @param {string} investmentId
 * @returns {Promise<void>}
 */
export const deleteInvestment = async (householdId, investmentId) => {
  if (!householdId || !investmentId) return;
  await deleteDoc(doc(db, `households/${householdId}/investments`, investmentId));
};
