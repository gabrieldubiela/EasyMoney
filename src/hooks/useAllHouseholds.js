// src/hooks/useAllHouseholds.js

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 

/**
 * Hook personalizado para buscar e monitorar todos os documentos da coleção 'households'.
 */
const useAllHouseholds = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const householdsRef = collection(db, 'households');
        // Ordena por nome para facilitar a visualização
        const q = query(householdsRef, orderBy('name', 'asc')); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                name: doc.data().name || 'Família Sem Nome', // Fallback
            }));
            setHouseholds(list);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Erro ao carregar lista de famílias:", err);
            setError("Falha ao carregar lista de famílias.");
            setLoading(false);
        });

        // Limpeza
        return () => unsubscribe();
    }, []);

    return { households, loading, error };
};

export default useAllHouseholds;