// src/services/categorieService.js

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Função para buscar as categorias
export const fetchCategories = async (householdId) => {
  try {
    const categoriesRef = collection(db, `households/${householdId}/categories`);
    const snapshot = await getDocs(categoriesRef);
    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    throw error;
  }
};

// Função para adicionar uma nova Categoria
export const addCategory = async (householdId, name) => {
  if (!householdId || !name.trim()) return;
  try {
    await addDoc(collection(db, `households/${householdId}/categories`), {
      name: name.trim(),
    });
  } catch (e) {
    console.error("Erro ao adicionar categoria:", e);
  }
};

// Função para atualizar uma Categoria
export const updateCategory = async (householdId, categoryId, newName) => {
  if (!householdId || !categoryId) return;

  const updateData = {};
  if (newName) updateData.name = newName.trim();

  try {
    await updateDoc(
      doc(db, `households/${householdId}/categories`, categoryId),
      updateData
    );
  } catch (e) {
    console.error("Erro ao atualizar categoria:", e);
  }
};

// Função para deletar uma Categoria
export const deleteCategory = async (householdId, categoryId) => {
  if (!householdId || !categoryId) return;

  if (
    !window.confirm(
      "ATENÇÃO: Excluir esta categoria não remove transações antigas. Continuar?"
    )
  )
    return;

  try {
    await deleteDoc(
      doc(db, `households/${householdId}/categories`, categoryId)
    );
  } catch (e) {
    console.error("Erro ao deletar categoria:", e);
  }
};
