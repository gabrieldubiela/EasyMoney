// src/hooks/useAllPlannedTransactions.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { fetchAllTransactions } from '../services/transactionService';
import { useAppContext } from './useAppContext';

const useAllPlannedTransactions = () => {
    const { householdId } = useAppContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const transactionsRef = collection(db, `households/${householdId}/plannedTransactions`);
        const unsubscribe = onSnapshot(transactionsRef, async () => {
            const data = await fetchAllTransactions(householdId, false);
            setTransactions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { transactions, loading };
};

export default useAllPlannedTransactions;
