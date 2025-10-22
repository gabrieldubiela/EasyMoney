// src/hooks/useHouseholdBaseData.js

import { useMemo } from 'react';
import { useAppContext } from '../context/useAppContext';

// Hooks principais
import useAllCategories from './useAllCategories';
import useAllTypes from './useAllTypes';
import useAllTransactions from './useAllTransactions';
import useAllPlannedTransactions from './useAllPlannedTransactions';
import useAllAlerts from './useAllAlerts';
import useAllBudgets from './useAllBudgets';
import useAllGoals from './useAllGoals';
import useAllGoalsAllocation from './useAllGoalsAllocation';
import useAllUsers from './useAllUsers';
import useAllInvestments from './useAllInvestments';
import useAllInvestmentsHistory from './useAllInvestmentsHistory';

/**
 * Hook agregador de todas as coleções-base da household.
 *
 * - Centraliza leitura das coleções mais usadas em dashboards e relatórios.
 * - Retorna também mapas otimizados para acesso direto (O(1)).
 * - Cada hook já usa o householdId internamente via contexto global.
 *
 * @returns {object} Dados consolidados da household.
 */
export default function useHouseholdBaseData() {
  const { householdId } = useAppContext(); // Mantém compatibilidade futura

  // 1️⃣ Hooks de dados Firestore
  const { categories, loading: loadingCat, error: errorCat } = useAllCategories();
  const { types, loading: loadingTypes, error: errorTypes } = useAllTypes();
  const { transactions, loading: loadingTrx, error: errorTrx } = useAllTransactions();
  const { transactions: planned, loading: loadingPlanned, error: errorPlanned } = useAllPlannedTransactions();
  const { alerts, loading: loadingAlerts, error: errorAlerts } = useAllAlerts();
  const { budgets, loading: loadingBudgets, error: errorBudgets } = useAllBudgets(new Date().getFullYear());
  const { goals, loading: loadingGoals, error: errorGoals } = useAllGoals();
  const { goalAllocations, loading: loadingAlloc, error: errorAlloc } = useAllGoalsAllocation();
  const { users, loading: loadingUsers, error: errorUsers } = useAllUsers();
  const { investments, loading: loadingInvestments, error: errorInvestments } = useAllInvestments();
  const { investmentsHistory, loading: loadingInvestHist, error: errorInvestHist } =
    useAllInvestmentsHistory();

  // 2️⃣ Construção de mapas otimizados para lookup
  const categoryMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const typeMap = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t])), [types]);
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  const goalMap = useMemo(() => Object.fromEntries(goals.map((g) => [g.id, g])), [goals]);
  const investmentMap = useMemo(
    () => Object.fromEntries(investments.map((i) => [i.id, i])),
    [investments]
  );

  // 3️⃣ Status global de carregamento e erro
  const loading =
    loadingCat ||
    loadingTypes ||
    loadingTrx ||
    loadingPlanned ||
    loadingAlerts ||
    loadingBudgets ||
    loadingUsers ||
    loadingGoals ||
    loadingAlloc ||
    loadingInvestments ||
    loadingInvestHist;

  const error =
    errorCat ||
    errorTypes ||
    errorTrx ||
    errorPlanned ||
    errorAlerts ||
    errorBudgets ||
    errorUsers ||
    errorGoals ||
    errorAlloc ||
    errorInvestments ||
    errorInvestHist;

  // 4️⃣ Dados consolidados retornados
  return {
    // Coleções principais
    categories,
    types,
    transactions,
    planned,
    alerts,
    budgets,
    goals,
    goalAllocations,
    users,
    investments,
    investmentsHistory,

    // Mapas otimizados
    categoryMap,
    typeMap,
    userMap,
    goalMap,
    investmentMap,

    // Indicadores globais
    loading,
    error,
  };
}
