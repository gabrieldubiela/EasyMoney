// src/services/householdService.js

import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Busca todas as famílias cadastradas, com opcionais filtros.
 * @param {object} [filters={}] - Filtros opcionais. Ex: userId, familyName, minMembers.
 * @param {string} [filters.userId] - Filtra famílias onde o usuário é membro.
 * @param {string} [filters.familyName] - Filtrar nome exato.
 * @param {number} [filters.minMembers] - Filtra famílias com ao menos X membros.
 * @returns {Promise<Array>} Array de famílias filtradas.
 */
export const fetchAllHouseholds = async (filters = {}) => {
  const householdsRef = collection(db, "households");
  const conditions = [];

  if (filters.userId) {
    conditions.push(where(`members.${filters.userId}`, "!=", null));
  }
  if (filters.familyName) conditions.push(where("familyName", "==", filters.familyName));

  const q = conditions.length > 0 ? query(householdsRef, ...conditions) : householdsRef;
  const snapshot = await getDocs(q);

  // Filtragem extra se usar minMembers
  let households = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  if (filters.minMembers) {
    households = households.filter(h => Object.keys(h.members || {}).length >= filters.minMembers);
  }

  return households;
};

/**
 * Busca os dados de uma família pelo ID.
 * @param {string} householdId - O ID da família.
 * @returns {Promise<Object>} Objeto de dados da família.
 */
export const fetchHouseholdById = async (householdId) => {
  const householdRef = doc(db, "households", householdId);
  const householdSnap = await getDoc(householdRef);
  if (householdSnap.exists()) {
    return householdSnap.data();
  } else {
    throw new Error("Família não encontrada.");
  }
};

/**
 * Cria uma nova família.
 * @param {string} householdId - O ID da nova família.
 * @param {string} familyName - Nome da família.
 * @param {string} UserId - UID do usuário criador/admin.
 * @returns {Promise<void>}
 */
export const createHousehold = async (familyName, userId) => {
  const res = await addDoc(collection(db, "households"), {
    familyName,
    members: {
      [userId]: true, // O criador é admin
    },
  });
  return res.id;
};

/**
 * Atualiza dados de uma família.
 * @param {string} householdId - O ID da família.
 * @param {string} familyName - Novo nome da família.
 * @param {Object} members - Novo map com membros (userId: boolean admin).
 * @returns {Promise<void>}
 */
export const updateHousehold = async (householdId, familyName, members) => {
  const householdRef = doc(db, "households", householdId);
  await updateDoc(householdRef, {
    familyName: familyName,
    members: members,
  });
};

/**
 * Atualiza o status de admin dos membros da família.
 * @param {string} householdId - O ID da família.
 * @param {Object} members - Map de membros com boolean (true = admin, false = membro comum).
 * @returns {Promise<void>}
 */
export const updateMemberAdminStatus = async (householdId, members) => {
  const householdRef = doc(db, "households", householdId);
  await updateDoc(householdRef, { members });
};

/**
 * Adiciona um novo membro a uma família existente.
 * @param {string} householdId - O ID da família.
 * @param {string} userId - UID do usuário a ser adicionado.
 * @returns {Promise<void>}
 */
export const addMemberToHousehold = async (householdId, userId) => {
  const householdRef = doc(db, "households", householdId);
  const householdSnap = await getDoc(householdRef);
  if (householdSnap.exists()) {
    await updateDoc(householdRef, {
      [`members.${userId}`]: false, // Novo membro não é admin por padrão
    });
  } else {
    throw new Error("Família não encontrada.");
  }
};

/**
 * Remove um membro da família.
 * Caso o último membro seja excluído, a família é apagada.
 * @param {string} householdId - O ID da família.
 * @param {string} userId - UID do usuário a ser removido.
 * @returns {Promise<void>}
 */
export const removeMemberFromHousehold = async (householdId, userId) => {
  const householdRef = doc(db, "households", householdId);
  const householdSnap = await getDoc(householdRef);
  if (householdSnap.exists()) {
    const members = householdSnap.data().members;
    if (Object.prototype.hasOwnProperty.call(members, userId)) {
      delete members[userId];
      if (Object.keys(members).length === 0) {
        await deleteHousehold(householdId);
      } else {
        await updateDoc(householdRef, { members });
      }
    } else {
      throw new Error("Membro não encontrado na família.");
    }
  } else {
    throw new Error("Família não encontrada.");
  }
};

/**
 * Exclui uma família.
 * @param {string} householdId - O ID da família.
 * @returns {Promise<void>}
 */
export const deleteHousehold = async (householdId) => {
  const householdRef = doc(db, "households", householdId);
  await deleteDoc(householdRef);
};
