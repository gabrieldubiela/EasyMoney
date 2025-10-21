// src/services/householdService.js

import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Função para buscar todos os dados das famílias (households)
export const fetchAllHouseholds = async () => {
  try {
    const householdsRef = collection(db, "households");
    const snapshot = await getDocs(householdsRef);
    const households = [];
    snapshot.forEach((doc) => {
      households.push({ id: doc.id, ...doc.data() });
    });
    return households;
  } catch (error) {
    console.error('Erro ao buscar famílias:', error);
    throw error;
  }
};

// Função para criar uma nova família (household)
export const createHousehold = async (householdId, familyName, creatorUserId) => {
  try {
    await setDoc(doc(db, 'households', householdId), {
      familyName: familyName,
      members: {
        [creatorUserId]: true // O criador é admin
      }
    });
  } catch (error) {
    console.error('Erro ao criar família:', error);
    throw error;
  }
};

// Função para adicionar um membro a uma família existente
export const addMemberToHousehold = async (householdId, userId) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (householdSnap.exists()) {
      await updateDoc(householdRef, {
        [`members.${userId}`]: false // Novo membro não é admin por padrão
      });
    } else {
      throw new Error('Família não encontrada.');
    }
    } catch (error) {
    console.error('Erro ao adicionar membro à família:', error);
    throw error;
  }
};

// Função para buscar os dados de uma família pelo ID
export const fetchHouseholdData = async (householdId) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (householdSnap.exists()) {
      return householdSnap.data();
    } else {
      throw new Error('Família não encontrada.');
    }
    } catch (error) {
    console.error('Erro ao buscar dados da família:', error);
    throw error;
  }
};

/** Função para atualizar dados de uma família pelo ID
 * @param {string} householdId - O ID da família.
 * @param {string} familyName - O novo nome da família.
 * @param {map} members - O novo mapa de membros da família.
 */
export const updateHouseholdData = async (householdId, familyName, members) => {
    try {
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      familyName: familyName,
      members: members
    });
  } catch (error) {
    console.error('Erro ao atualizar dados da família:', error);
    throw error;
  }
};

// Função para alterar se um membro é admin ou não. O map possui um boolean para cada membro, true=admin, false=não admin
export const updateMemberAdminStatus = async (householdId, members) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    await updateDoc(householdRef, {
      members: members
    });
  } catch (error) {
    console.error('Erro ao atualizar status de admin dos membros:', error);
    throw error;
  }
};

// Função para excluir um membro de uma família. Os membros da família em um map com userId como chave.
export const removeMemberFromHousehold = async (householdId, userId) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);
    if (householdSnap.exists()) {
      const members = householdSnap.data().members;
        if (hasOwnProperty(members, userId)) {
            delete members[userId];
            await updateDoc(householdRef, {
                members: members
            });
        } else {
            throw new Error('Membro não encontrado na família.');
        }
    } else {
      throw new Error('Família não encontrada.');
    }  
    } catch (error) {
    console.error('Erro ao remover membro da família:', error);
    throw error;
  }
};

// Função para excluir uma família pelo ID
export const deleteHousehold = async (householdId) => {
  try {
    const householdRef = doc(db, 'households', householdId);
    await deleteDoc(householdRef);
  } catch (error) {
    console.error('Erro ao excluir família:', error);
    throw error;
  }
};