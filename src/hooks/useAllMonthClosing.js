// src/hooks/useAllMonthClosing.js
import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { useAppContext } from "../context/useAppContext";

export default function useAllMonthClosing() {
  const { householdId } = useAppContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!householdId) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const ref = collection(db, `households/${householdId}/monthlyClosings`);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [householdId]);

  return { closings: data, loading };
}
