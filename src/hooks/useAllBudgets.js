import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook para escutar todas as categorias de orçamento de um ano em tempo real.
 * Permite filtros opcionais como tipos específicos ou metas definidas (valor > 0).
 *
 * @param {string|number} year - Ano do orçamento.
 * @param {object} [filters={}] - Filtros opcionais.
 *   { typeId, hasGoal }
 * @returns {object} { budgets, loading, error }
 */
const useAllBudgets = (year, filters = {}) => {
  const { householdId } = useAppContext();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!householdId || !year) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const budgetsRef = collection(db, `households/${householdId}/budgets/${year}/categories`);

    // Como budgets têm subcampos dinâmicos (types), a query Firestore é limitada
    // Então aplicamos filtro JS localmente após leitura
    const q = query(budgetsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Filtro por tipo (categoria que contém esse tipo)
        if (filters.typeId) {
          data = data.filter(b => b.types && Object.keys(b.types).includes(filters.typeId));
        }

        // Filtro por meta definida (algum tipo com valor > 0)
        if (filters.hasGoal) {
          data = data.filter(b => {
            if (!b.types) return false;
            return Object.values(b.types).some(t => t.valor > 0);
          });
        }

        setBudgets(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [householdId, year, filters.typeId, filters.hasGoal]);

  return { budgets, loading, error };
};

export default useAllBudgets;
