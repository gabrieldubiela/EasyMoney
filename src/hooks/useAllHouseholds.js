// src/hooks/useAllHouseholds.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { fetchAllHouseholds } from '../services/householdService';

const useAllHouseholds = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const householdsRef = collection(db, 'households');
        const unsubscribe = onSnapshot(householdsRef, async () => {
            const data = await fetchAllHouseholds();
            setHouseholds(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { households, loading };
};

export default useAllHouseholds;
