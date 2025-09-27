// src/hooks/useTypes.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useHousehold } from '../hooks/useHousehold';
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'; 

/**
 * Hook para gerenciar os Tipos de Gasto (Receita, Fixo, Variável, etc.)
 * Os Tipos serão armazenados na coleção 'types' dentro da household.
 */
const useTypes = () => {
    const { householdId } = useHousehold();
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Monitora os Tipos do Firestore
    useEffect(() => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        const typesRef = collection(db, `households/${householdId}/types`);
        const q = query(typesRef, orderBy('name', 'asc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const typesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTypes(typesList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao carregar Tipos:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [householdId]);

    // 2. Funções CRUD
    const addType = async (name, isIncome = false) => {
        if (!householdId || !name.trim()) return;
        try {
            await addDoc(collection(db, `households/${householdId}/types`), {
                name: name.trim(),
                isIncome: isIncome, // Flag para distinguir Receita (verde) de Despesa (vermelho)
            });
        } catch (e) {
            console.error("Erro ao adicionar tipo:", e);
        }
    };

    const deleteType = async (typeId) => {
        if (!householdId || !typeId) return;
        if (!window.confirm("ATENÇÃO: Excluir um Tipo pode desvincular categorias. Tem certeza?")) return;
        try {
            await deleteDoc(doc(db, `households/${householdId}/types`, typeId));
        } catch (e) {
            console.error("Erro ao deletar tipo:", e);
        }
    };

    const updateType = async (typeId, newName, newIsIncome) => {
    if (!householdId || !typeId) return;
    
    const updateData = {};
    if (newName) updateData.name = newName.trim();
    if (newIsIncome !== undefined) updateData.isIncome = newIsIncome;

    try {
        await updateDoc(doc(db, `households/${householdId}/types`, typeId), updateData);
    } catch (e) {
        console.error("Erro ao atualizar tipo:", e);
    }
};

return { types, loading, addType, deleteType, updateType };
};

export default useTypes;