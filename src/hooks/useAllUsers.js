import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Hook para escutar todos os usuários em tempo real, com filtros dinâmicos.
 * Permite filtrar por household, admin, ativo, nome, etc.
 *
 * @param {object} [filters={}] - Filtros opcionais.
 *   { householdId, isAdmin, isActive, name }
 * @returns {object} { users, loading, error }
 */
const useAllUsers = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    const usersRef = collection(db, 'users');
    const conditions = [];

    if (filters.householdId)
      conditions.push(where('householdId', 'array-contains', filters.householdId));
    if (filters.isAdmin !== undefined)
      conditions.push(where('isAdmin', '==', filters.isAdmin));
    if (filters.isActive !== undefined)
      conditions.push(where('isActive', '==', filters.isActive));
    if (filters.name)
      conditions.push(where('name', '==', filters.name));

    const q = conditions.length > 0 ? query(usersRef, ...conditions) : usersRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [
    filters.householdId,
    filters.isAdmin,
    filters.isActive,
    filters.name,
  ]);

  return { users, loading, error };
};

export default useAllUsers;
