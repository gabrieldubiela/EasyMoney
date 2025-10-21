// src/services/userService.js

import { doc, getDoc, deleteDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Função para buscar todos usuários
export const fetchAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    }
    );
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw error;
  }
};

// Função para buscar os dados do usuário pelo UID
export const fetchUserData = async (uid) => {
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

/** Função para atualizar os dados do usuário pelo UID
 * @param {string} uid - O UID do usuário.
 * @param {array} householdId - Array de IDs das famílias do usuário.
 * @param {boolean} isAdmin - Se o usuário é admin do sistema.
 * @param {string} name - Nome do usuário.
 * A função recebe todos os campos a serem atualizados como parâmetros.
 */
export const updateUserData = async (uid, householdId, isAdmin, name) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      [householdId]: householdId,
      isAdmin: isAdmin,
      name: name,
    });
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    throw error;
  }
};

// Função para excluir o usuário pelo UID
export const deleteUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
    // Chama a função de exclusão do usuário de uma família
  } catch (error) {
    console.error("Erro ao excluir dados do usuário:", error);
    throw error;
  }
};
