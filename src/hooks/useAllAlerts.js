// src/hooks/useAllAlerts.js

import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * Hook para escutar alertas em tempo real.
 * Suporta filtros opcionais por tipo e status.
 *
 * @param {object} [filters] - Filtros opcionais ({ type, status }).
 * @returns {object} { alerts, loading, error }
 */
const useAllAlerts = (filters = {}) => {
  const { householdId } = useAppContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const alertsRef = collection(db, `households/${householdId}/alerts`);

    // constrói query programaticamente conforme os filtros enviados
    const conditions = [];
    if (filters.type) conditions.push(where('alertType', '==', filters.type));
    if (filters.status) conditions.push(where('status', '==', filters.status));

    const q = conditions.length > 0 ? query(alertsRef, ...conditions) : alertsRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlerts(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao escutar alertas:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, filters.type, filters.status]);

  return { alerts, loading, error };
};

export default useAllAlerts;