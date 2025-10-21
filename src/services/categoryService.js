// src/services/categoryService.js

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
 * Busca todas as categorias de uma família.
 * @param {string} householdId - O ID da família.
 * @returns {Promise<Array>} Array de objetos categoria.
 */
export const fetchAllCategories = async (householdId) => {
  const categoriesRef = collection(db, `households/${householdId}/categories`);
  const snapshot = await getDocs(categoriesRef);
  const categories = [];
  snapshot.forEach((doc) => {
    categories.push({ id: doc.id, ...doc.data() });
  });
  return categories;
};

/**
 * Busca categoria por ID.
 * @param {string} householdId - O ID da família.
 * @param {string} categoryId - O ID da categoria.
 * @returns {Promise<Object>} Objeto categoria.
 */
export const fetchCategoryById = async (householdId, categoryId) => {
  const categoryRef = doc(db, `households/${householdId}/categories`, categoryId);
  const categorySnap = await getDoc(categoryRef);
  if (categorySnap.exists()) {
    return { id: categorySnap.id, ...categorySnap.data() };
  } else {
    throw new Error("Categoria não encontrada.");
  }
};

/**
 * Adiciona uma nova categoria.
 * @param {string} householdId - O ID da família.
 * @param {string} name - O nome da categoria.
 * @returns {Promise<void>}
 */
export const createCategory = async (householdId, name) => {
  if (!householdId || !name.trim()) return;
  await addDoc(collection(db, `households/${householdId}/categories`), {
    name: name.trim(),
  });
};

/**
 * Atualiza uma categoria.
 * @param {string} householdId - O ID da família.
 * @param {string} categoryId - O ID da categoria.
 * @param {string} newName - Novo nome da categoria.
 * @returns {Promise<void>}
 */
export const updateCategory = async (householdId, categoryId, newName) => {
  if (!householdId || !categoryId) return;
  const updateData = {};
  if (newName) updateData.name = newName.trim();
  await updateDoc(doc(db, `households/${householdId}/categories`, categoryId), updateData);
};

/**
 * Deleta uma categoria.
 * @param {string} householdId - O ID da família.
 * @param {string} categoryId - O ID da categoria.
 * @returns {Promise<void>}
 */
export const deleteCategory = async (householdId, categoryId) => {
  if (!householdId || !categoryId) return;
  await deleteDoc(doc(db, `households/${householdId}/categories`, categoryId));
};
