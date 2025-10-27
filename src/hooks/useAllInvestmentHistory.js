// src/hooks/useAllInvestmentHistory.js

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAppContext } from "../context/useAppContext";

const useAllInvestmentHistory = (investmentId) => {
  const { householdId } = useAppContext();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Caso NÃO tenha householdId ou investmentId, retorne histórico zero e loading finalizado!
    if (!householdId || !investmentId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const colRef = collection(
      db,
      `households/${householdId}/investments/${investmentId}/history`
    );

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHistory(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, investmentId]);

  return { history, loading, error };
};

export default useAllInvestmentHistory;
