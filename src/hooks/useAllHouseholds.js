// src/hooks/useAllHouseholds.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const useAllHouseholds = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const householdsRef = collection(db, 'households');
        const q = query(householdsRef, orderBy('family_name', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const householdsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setHouseholds(householdsList);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Erro ao carregar famílias:", err);
            setError("Falha ao carregar famílias.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { households, loading, error };
};

export default useAllHouseholds;
