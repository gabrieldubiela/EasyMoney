// src/hooks/useAllGoalAllocations.js

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAppContext } from "../context/useAppContext";

const useAllGoalAllocations = () => {
  const { householdId } = useAppContext();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) return;
    setLoading(true);

    const colRef = collection(db, `households/${householdId}/investmentAllocations`);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAllocations(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId]);

  return { allocations, loading, error };
};

export default useAllGoalAllocations;
