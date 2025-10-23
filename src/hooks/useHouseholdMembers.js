import { useState, useCallback, useEffect } from "react";
import {
  fetchHouseholdById,
  updateMemberAdminStatus,
  removeMemberFromHousehold,
} from "../services/householdService";

/**
 * Hook para manipular membros de uma família.
 */
export function useHouseholdMembers(householdId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchHouseholdById(householdId);
      const membersObj = data.members || {};
      setMembers(Object.entries(membersObj).map(([uid, isAdmin]) => ({ uid, isAdmin })));
    } catch (err) {
      setError("Erro ao carregar membros.");
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const setAdminStatus = async (uid, isAdmin) => {
    setLoading(true);
    setError("");
    try {
      // Pega estado atual/recentíssimo
      const data = await fetchHouseholdById(householdId);
      const membersObj = { ...(data.members || {}) };
      membersObj[uid] = isAdmin;
      await updateMemberAdminStatus(householdId, membersObj);
      await fetchMembers();
      return true;
    } catch (err) {
      setError("Erro ao atualizar permissão.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (uid) => {
    setLoading(true);
    setError("");
    try {
      await removeMemberFromHousehold(householdId, uid);
      await fetchMembers();
      return true;
    } catch (err) {
      setError("Erro ao remover membro.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { members, loading, error, setAdminStatus, removeMember, refetch: fetchMembers };
}

export default useHouseholdMembers;
