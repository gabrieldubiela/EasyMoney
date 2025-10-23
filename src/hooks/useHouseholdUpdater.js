import { useState, useCallback } from 'react';
import {
  fetchHouseholdById,
  updateHousehold,
} from '../services/householdService';

/**
 * Hook para ler e atualizar dados básicos de uma família.
 *
 * @param {string} householdId - O ID da família.
 * @returns {object} { household, loading, error, updateHouseholdName }
 */
export function useHouseholdUpdater(householdId) {
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar dados da família
  const fetch = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHouseholdById(householdId);
      setHousehold(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  // Atualizar nome da família (mantém membros)
  const updateHouseholdName = useCallback(
    async (newName) => {
      if (!householdId || !household) return;
      setLoading(true);
      setError(null);
      try {
        await updateHousehold(householdId, newName, household.members);
        setHousehold({ ...household, familyName: newName });
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [householdId, household]
  );

  // Carrega dados na montagem ou quando householdId muda
  // (ideal: useEffect no componente)
  return { household, loading, error, fetch, updateHouseholdName };
}

export default useHouseholdUpdater;
