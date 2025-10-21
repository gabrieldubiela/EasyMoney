// src/hooks/useAllCategories.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';
import { collection, onSnapshot } from 'firebase/firestore';

/**
 * Hook para escutar todas as categorias de uma família em tempo real.
 * Retorna atualização automática quando qualquer categoria é adicionada, editada ou removida.
 *
 * @returns {object} { categories, loading, error }
 */
const useAllCategories = () => {
  const { householdId } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const categoriesRef = collection(db, `households/${householdId}/categories`);

    const unsubscribe = onSnapshot(
      categoriesRef,
      (snapshot) => {
        const categoryList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao escutar categorias:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId]);

  return { categories, loading, error };
};

export default useAllCategories;
