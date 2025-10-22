// src/hooks/useBalance.js

import { useMemo } from 'react';
import useAllTransactions from './useAllTransactions';
import useAllPlannedTransactions from './useAllPlannedTransactions';
import useAllCategories from './useAllCategories';
import useAllTypes from './useAllTypes';

/**
 * Hook responsável por calcular o balanço financeiro mensal da família,
 * combinando os dados de diferentes coleções do Firestore:
 *   - useAllTransactions: transações efetivas (realizadas)
 *   - useAllPlannedTransactions: transações planejadas (a realizar)
 *   - useAllCategories: categorias de transações
 *   - useAllTypes: tipos (ex: receita, despesa, fixa, variável)
 *
 * @param {number|string} year - Ano de referência (ex: 2025).
 * @param {number|string} month - Mês de referência (1 a 12).
 * @returns {object} Dados consolidados do balanço:
 *    { effectiveTransactions, plannedTransactions, categories, types, incomeEffective,
 *      expenseEffective, incomePlanned, expensePlanned, netEffective, netPlanned, loading }
 */
export default function useBalance(year, month) {
  /** ---------------------------
   * 1. Hooks de dados Firestore
   * --------------------------*/

  // Transações efetivas do mês
  const {
    transactions: effectiveTransactions,
    loading: loadingEffective,
  } = useAllTransactions({
    yearMonth: `${year}${String(month).padStart(2, '0')}`,
    planned: false,
  });

  // Transações planejadas
  const {
    transactions: plannedTransactions,
    loading: loadingPlanned,
  } = useAllPlannedTransactions();

  // Categorias e Tipos
  const { categories, loading: loadingCategories } = useAllCategories();
  const { types, loading: loadingTypes } = useAllTypes();

  /** ----------------------------------------
   * 2. Cálculos de balanço consolidado
   * ---------------------------------------*/
  const financialData = useMemo(() => {
    // Caso ainda não esteja carregado
    if (!effectiveTransactions || !plannedTransactions) {
      return {
        incomeEffective: 0,
        expenseEffective: 0,
        incomePlanned: 0,
        expensePlanned: 0,
        netEffective: 0,
        netPlanned: 0,
      };
    }

    // Transações realizadas
    const incomeEffective = effectiveTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseEffective = effectiveTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Transações planejadas
    const incomePlanned = plannedTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expensePlanned = plannedTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      incomeEffective,
      expenseEffective,
      incomePlanned,
      expensePlanned,
      netEffective: incomeEffective + expenseEffective,
      netPlanned: incomePlanned + expensePlanned,
    };
  }, [effectiveTransactions, plannedTransactions]);

  /** ---------------------------
   * 3. Estado de carregamento unificado
   * --------------------------*/
  const loading =
    loadingEffective || loadingPlanned || loadingCategories || loadingTypes;

  /** ---------------------------
   * 4. Dados retornados pelo hook
   * --------------------------*/
  return {
    effectiveTransactions,
    plannedTransactions,
    categories,
    types,
    ...financialData,
    loading,
  };
}
