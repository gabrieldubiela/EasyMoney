// src/hooks/useCategories.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useHousehold } from '../hooks/useHousehold';
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'; 

/**
 * Hook para buscar, monitorar e gerenciar a coleção de Categorias (CRUD).
 * Cada categoria é vinculada ao ID de um Tipo (typeId) para flexibilidade.
 */
const useCategories = () => {
    const { householdId } = useHousehold();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Monitora as Categorias do Firestore
    useEffect(() => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        const categoriesRef = collection(db, `households/${householdId}/categories`);
        // Ordena por nome para exibição na interface
        const q = query(categoriesRef, orderBy('name', 'asc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Garante que 'typeId' existe, mesmo que seja nulo
                typeId: doc.data().typeId || null,
            }));
            setCategories(categoriesList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao carregar Categorias:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [householdId]);

    // 2. Funções CRUD

    // Adiciona uma nova Categoria, vinculada a um Tipo
    const addCategory = async (name, typeId) => {
        if (!householdId || !name.trim() || !typeId) return;
        try {
            await addDoc(collection(db, `households/${householdId}/categories`), {
                name: name.trim(),
                typeId: typeId, // ID do Tipo (Ex: Fixo, Variável, Receita)
            });
        } catch (e) {
            console.error("Erro ao adicionar categoria:", e);
        }
    };

    // Atualiza o nome ou o Tipo de uma Categoria existente
    const updateCategory = async (categoryId, newName, newTypeId) => {
        if (!householdId || !categoryId) return;
        
        const updateData = {};
        if (newName) updateData.name = newName.trim();
        if (newTypeId) updateData.typeId = newTypeId;

        try {
            await updateDoc(doc(db, `households/${householdId}/categories`, categoryId), updateData);
        } catch (e) {
            console.error("Erro ao atualizar categoria:", e);
        }
    };

    // Deleta uma Categoria
    const deleteCategory = async (categoryId) => {
        if (!householdId || !categoryId) return;
        
        if (!window.confirm("ATENÇÃO: Excluir esta categoria não remove transações antigas. Continuar?")) return;

        try {
            await deleteDoc(doc(db, `households/${householdId}/categories`, categoryId));
        } catch (e) {
            console.error("Erro ao deletar categoria:", e);
        }
    };

    return { categories, loading, addCategory, updateCategory, deleteCategory };
};

export default useCategories;