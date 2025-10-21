// src/services/typeService.js

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Busca todos os tipos cadastrados de uma família.
 * @param {string} householdId - O ID da família.
 * @returns {Promise<Array>} Array de objetos tipo.
 */
export const fetchAllTypes = async (householdId) => {
  const typesRef = collection(db, `households/${householdId}/types`);
  const snapshot = await getDocs(typesRef);
  const types = [];
  snapshot.forEach((doc) => {
    types.push({ id: doc.id, ...doc.data() });
  });
  return types;
};

/**
 * Busca tipo por ID.
 * @param {string} householdId - O ID da família.
 * @param {string} typeId - O ID do tipo.
 * @returns {Promise<Object>} Objeto tipo.
 */
export const fetchTypeById = async (householdId, typeId) => {
  const typeRef = doc(db, `households/${householdId}/types`, typeId);
  const typeSnap = await getDoc(typeRef);
  if (typeSnap.exists()) {
    return { id: typeSnap.id, ...typeSnap.data() };
  } else {
    throw new Error("Tipo não encontrado.");
  }
};

/**
 * Adiciona um tipo.
 * @param {string} householdId - O ID da família.
 * @param {string} name - O nome do tipo.
 * @param {boolean} isIncome - True para receitas, False para despesas.
 * @returns {Promise<void>}
 */
export const createType = async (householdId, name, isIncome = false) => {
  if (!householdId || !name.trim()) return;
  await addDoc(collection(db, `households/${householdId}/types`), {
    name: name.trim(),
    isIncome: isIncome,
  });
};

/**
 * Atualiza um tipo.
 * @param {string} householdId - O ID da família.
 * @param {string} typeId - O ID do tipo.
 * @param {string} newName - Novo nome do tipo.
 * @param {boolean} newIsIncome - Novo valor de receita/despesa.
 * @returns {Promise<void>}
 */
export const updateType = async (householdId, typeId, newName, newIsIncome) => {
  if (!householdId || !typeId) return;
  const updateData = {};
  if (newName) updateData.name = newName.trim();
  if (newIsIncome !== undefined) updateData.isIncome = newIsIncome;
  await updateDoc(doc(db, `households/${householdId}/types`, typeId), updateData);
};

/**
 * Deleta um tipo.
 * @param {string} householdId - O ID da família.
 * @param {string} typeId - O ID do tipo.
 * @returns {Promise<void>}
 */
export const deleteType = async (householdId, typeId) => {
  if (!householdId || !typeId) return;
  await deleteDoc(doc(db, `households/${householdId}/types`, typeId));
};
