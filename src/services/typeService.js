// src/services/typeService.js

import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Função para buscar os tipos
export const fetchTypes = async (householdId) => {
  try {
    const typesRef = collection(db, `households/${householdId}/types`);
    const snapshot = await getDocs(typesRef);
    const types = [];
    snapshot.forEach((doc) => {
      types.push({ id: doc.id, ...doc.data() });
    });
    return types;
  } catch (error) {
    console.error("Erro ao buscar tipos:", error);
    throw error;
  }
};

// Função para adicionar um novo Tipo
export const addType = async (householdId, name, isIncome = false) => {
  if (!householdId || !name.trim()) return;
  try {
    await addDoc(collection(db, `households/${householdId}/types`), {
      name: name.trim(),
      isIncome: isIncome,
    });
  } catch (e) {
    console.error("Erro ao adicionar tipo:", e);
  }
};

// Função para deletar um Tipo
export const deleteType = async (householdId, typeId) => {
  if (!householdId || !typeId) return;
  try {
    await deleteDoc(doc(db, `households/${householdId}/types`, typeId));
  } catch (e) {
    console.error("Erro ao deletar tipo:", e);
  }
};

// Função para atualizar um Tipo
export const updateType = async (householdId, typeId, newName, newIsIncome) => {
  if (!householdId || !typeId) return;

  const updateData = {};
  if (newName) updateData.name = newName.trim();
  if (newIsIncome !== undefined) updateData.isIncome = newIsIncome;

  try {
    await updateDoc(
      doc(db, `households/${householdId}/types`, typeId),
      updateData
    );
  } catch (e) {
    console.error("Erro ao atualizar tipo:", e);
  }
};
