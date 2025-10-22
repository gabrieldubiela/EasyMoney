// src/hooks/useAllInvestments.js

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAppContext } from "../context/useAppContext";

const useAllInvestments = (filters = {}) => {
  const { householdId } = useAppContext();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) return;
    setLoading(true);

    const colRef = collection(db, `households/${householdId}/investments`);
    const conditions = [];

    if (filters.minValue) conditions.push(where("currentAmount", ">=", filters.minValue));
    if (filters.maxValue) conditions.push(where("currentAmount", "<=", filters.maxValue));

    const q = conditions.length > 0 ? query(colRef, ...conditions) : colRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setInvestments(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, filters.minValue, filters.maxValue]);

  return { investments, loading, error };
};

export default useAllInvestments;
