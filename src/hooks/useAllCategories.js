// src/hooks/useAllCategories.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { fetchAllCategories } from '../services/categoryService';

const useAllCategories = () => {
  const { householdId } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    const categoriesRef = collection(db, `households/${householdId}/categories`);
    const unsubscribe = onSnapshot(categoriesRef, async (snapshot) => {
      const data = await fetchAllCategories(householdId);
      setCategories(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [householdId]);

  return { categories, loading };
};

export default useAllCategories;
