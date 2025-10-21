// src/hooks/useHouseholdBaseData.js

import { useMemo } from 'react';

// Hooks de coleções já existentes
import useAllCategories from './useAllCategories';
import useAllTypes from './useAllTypes';
import useAllTransactions from './useAllTransactions';
import useAllPlannedTransactions from './useAllPlannedTransactions';
import useScheduledPayments from './useScheduledPayments';

// (Opcional: outros hooks agregáveis)
import useAnnualData from './useAnnualData';
import useMonthClosingStatus from './useMonthClosingStatus';

/**
 * Hook agregador de todas as coleções-base do Household.
 * Ideal para dashboards, relatórios e telas que combinam várias fontes simultaneamente.
 *
 * Retorna dados, versões otimizadas em Map, e status global de loading/erro.
 */
const useHouseholdBaseData = (options = {}) => {
  const { 
    includeAnnualData = false,
    includeMonthStatus = false,
  } = options;

  // 1️⃣ Dados de referência (sempre carregados)
  const { categories, loading: categoriesLoading, error: categoriesError } = useAllCategories();
  const { types, loading: typesLoading, error: typesError } = useAllTypes();

  // 2️⃣ Dados dinâmicos
  const { transactions, loading: trxLoading, error: trxError } = useAllTransactions();
  const { transactions: plannedTransactions, loading: plannedLoading, error: plannedError } =
    useAllPlannedTransactions();
  const { upcomingPayments, loading: paymentsLoading, error: paymentsError } = useScheduledPayments();

  // 3️⃣ Dados complementares (opcionais, apenas se solicitados)
  const annual = includeAnnualData ? useAnnualData(new Date().getFullYear()) : {};
  const monthStatus = includeMonthStatus ? useMonthClosingStatus() : {};

  // 4️⃣ Cria mapas otimizados para acesso rápido (O(1))
  const categoryMap = useMemo(() => {
    const map = {};
    for (const cat of categories) map[cat.id] = cat;
    return map;
  }, [categories]);

  const typeMap = useMemo(() => {
    const map = {};
    for (const t of types) map[t.id] = t;
    return map;
  }, [types]);

  const transactionGroupMap = useMemo(() => {
    const map = {};
    for (const trx of transactions) {
      if (!trx.transactionGroupId) continue;
      if (!map[trx.transactionGroupId]) map[trx.transactionGroupId] = [];
      map[trx.transactionGroupId].push(trx);
    }
    return map;
  }, [transactions]);

  // 5️⃣ Status global de carregamento e erros
  const loading =
    categoriesLoading ||
    typesLoading ||
    trxLoading ||
    plannedLoading ||
    paymentsLoading ||
    (includeAnnualData && annual?.loading) ||
    (includeMonthStatus && monthStatus?.loading);

  const error =
    categoriesError ||
    typesError ||
    trxError ||
    plannedError ||
    paymentsError ||
    (includeAnnualData && annual?.error) ||
    (includeMonthStatus && monthStatus?.error);

  // 6️⃣ Retorno unificado
  return {
    // Dados brutos
    categories,
    types,
    transactions,
    plannedTransactions,
    upcomingPayments,

    // Mapas de acesso rápido
    categoryMap,
    typeMap,
    transactionGroupMap,

    // Dados complementares opcionais
    annualData: annual?.annualData,
    monthStatus: monthStatus?.needsClosing,

    // Status
    loading,
    error,
  };
};

export default useHouseholdBaseData;
