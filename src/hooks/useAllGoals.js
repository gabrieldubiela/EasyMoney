// src/hooks/useAllGoals.js

import { useState, useEffect } from "react";
import { collection, onSnapshot, where, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAppContext } from "../context/useAppContext";

const useAllGoals = (filters = {}) => {
  const { householdId } = useAppContext();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) return;
    setLoading(true);

    const colRef = collection(db, `households/${householdId}/goals`);
    const conditions = [];

    if (filters.status) conditions.push(where("status", "==", filters.status));

    const q = conditions.length > 0 ? query(colRef, ...conditions) : colRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, filters.status]);

  return { goals, loading, error };
};

export default useAllGoals;
