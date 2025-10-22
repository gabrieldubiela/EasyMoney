// src/services/userService.js

import { doc, getDoc, setDoc, deleteDoc, updateDoc, getDocs, collection, where, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { removeUserFromHousehold } from "./householdService";

/**
 * Busca usuários do sistema com filtros dinâmicos.
 * @param {object} [filters={}] - Filtros opcionais (ex: isAdmin, householdId, isActive, name).
 * @param {string} [filters.householdId] - ID da família.
 * @param {boolean} [filters.isAdmin] - Filtrar apenas admins.
 * @param {boolean} [filters.isActive] - Filtrar apenas ativos.
 * @param {string} [filters.name] - Buscar por nome exato.
 * @returns {Promise<Array>} Lista de usuários filtrados.
 */
export const fetchAllUsers = async (filters = {}) => {
  const usersRef = collection(db, "users");
  const conditions = [];

  if (filters.householdId) {
    // householdId pode ser array; usamos array-contains
    conditions.push(where("householdId", "array-contains", filters.householdId));
  }
  if (filters.isAdmin !== undefined) conditions.push(where("isAdmin", "==", filters.isAdmin));
  if (filters.isActive !== undefined) conditions.push(where("isActive", "==", filters.isActive));
  if (filters.name) conditions.push(where("name", "==", filters.name));

  const q = conditions.length > 0 ? query(usersRef, ...conditions) : usersRef;

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Busca os dados do usuário pelo UID.
 * @param {string} uid - O UID do usuário.
 * @returns {Promise<Object>} Objeto de dados do usuário.
 */
export const fetchUserById = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      throw new Error("Usuário não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    throw error;
  }
};

/**
 * Cria um novo usuário no Firestore.
 * @param {string} uid - O UID do usuário.
 * @param {Array<string>} householdIdArray - Array de IDs de famílias do usuário.
 * @param {boolean} isAdmin - Se o usuário é admin do sistema.
 * @param {string} name - Nome do usuário.
 * @returns {Promise<void>}
 */
export const createUser = async (uid, householdIdArray, isAdmin, name) => {
  try {
    await setDoc(doc(db, "users", uid), {
      householdId: householdIdArray,
      isAdmin,
      name,
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

/**
 * Atualiza os dados do usuário pelo UID.
 * @param {string} uid - O UID do usuário.
 * @param {Array<string>|string} householdId - Array de IDs das famílias do usuário (ou string, será convertido).
 * @param {boolean} isAdmin - Se o usuário é admin do sistema.
 * @param {string} name - Nome do usuário.
 * @returns {Promise<void>}
 */
export const updateUser = async (uid, householdId, isAdmin, name) => {
  try {
    const householdIdArray = Array.isArray(householdId) ? householdId : [householdId];
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      householdId: householdIdArray,
      isAdmin,
      name,
    });
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    throw error;
  }
};

/**
 * Exclui o usuário pelo UID.
 * @param {string} uid - O UID do usuário.
 * @returns {Promise<void>}
 */
export const deleteUser = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
    await removeUserFromHousehold(uid); // Remove de todas as famílias onde era membro
  } catch (error) {
    console.error("Erro ao excluir dados do usuário:", error);
    throw error;
  }
};
