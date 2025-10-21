// src/hooks/useAllTypes.js

import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { fetchAllTypes } from '../services/typeService';
import { useAppContext } from '../context/useAppContext';

const useAllTypes = () => {
  const { householdId } = useAppContext();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const typesRef = collection(db, `households/${householdId}/types`);
    const unsubscribe = onSnapshot(typesRef, async () => {
      const data = await fetchAllTypes();
      setTypes(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { types, loading };
};

export default useAllTypes;
