// src/hooks/useTypes.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 

/**
 * Hook para gerenciar os Tipos de Gasto (Receita, Fixo, Variável, etc.)
 * Os Tipos serão armazenados na coleção 'types' dentro da household.
 */
const useTypes = () => {
    const { householdId } = useAppContext();
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

    return { types, loading };
};

export default useTypes;