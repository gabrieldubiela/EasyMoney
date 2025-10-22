import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Hook para escutar todas as famílias em tempo real, com filtros dinâmicos.
 * Permite filtrar por usuário, nome, número de membros, etc.
 *
 * @param {object} [filters={}] - Filtros opcionais. Ex: userId, familyName, minMembers.
 * @returns {object} { households, loading, error }
 */
const useAllHouseholds = (filters = {}) => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    const householdsRef = collection(db, 'households');
    const conditions = [];

    // Como Firestore não permite filtro direto em nested keys, aqui é só para campos normais
    if (filters.familyName)
      conditions.push(where('familyName', '==', filters.familyName));

    // userId: filtragem por membros só funciona se criar índice (se for muito usado, considere Cloud Function)
    // Aqui podemos buscar todas, depois filtrar por JS localmente se necessário:
    // (usando filter() na lista depois do snapshot)

    const q = conditions.length > 0 ? query(householdsRef, ...conditions) : householdsRef;

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Filtro por usuários (em JS, pois Firestore não indexa subcampos dinâmicos)
        if (filters.userId) {
          data = data.filter(h => h.members && Object.keys(h.members).includes(filters.userId));
        }

        // Filtro por mínimo de membros
        if (filters.minMembers) {
          data = data.filter(h => Object.keys(h.members || {}).length >= filters.minMembers);
        }

        setHouseholds(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters.familyName, filters.userId, filters.minMembers]);

  return { households, loading, error };
};

export default useAllHouseholds;
