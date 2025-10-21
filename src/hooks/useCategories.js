// src/hooks/useCategories.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/AppContext';
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'; 

// Hook para buscar, monitorar e gerenciar a coleção de Categorias (CRUD).
const useCategories = () => {
    const { householdId } = useAppContext();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Monitora as Categorias do Firestore
    useEffect(() => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        const categoriesRef = collection(db, `households/${householdId}/categories`);
        const q = query(categoriesRef, orderBy('name', 'asc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const categoriesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCategories(categoriesList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao carregar Categorias:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [householdId]);

    

    return { categories, loading };
};

export default useCategories;