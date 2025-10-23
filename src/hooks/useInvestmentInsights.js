// src/hooks/useInvestmentInsights.js

import { useMemo } from "react";

/**
 * Recebe listas brutas de investimentos e metas, e retorna indicadores agregados para dashboards.
 * 
 * @param {Array} investments - Lista de investimentos do usuário
 * @param {Array} goals - Metas financeiras (relacionadas a investimentos)
 * @returns {object} { totalPortfolio, roi, goalStatus }
 */
export default function useInvestmentInsights(investments = [], goals = []) {
  return useMemo(() => {
    // Total investido atualmente
    const totalPortfolio = investments.reduce(
      (sum, i) => sum + (i.currentAmount || 0), 0
    );

    // Total investido inicialmente
    const totalInitial = investments.reduce(
      (sum, i) => sum + (i.initialAmount || 0), 0
    );

    // ROI (Return over Investment)
    const roi = totalInitial > 0 ? ((totalPortfolio - totalInitial) / totalInitial) * 100 : 0;

    // Status de metas (porcentagem de atingimento)
    const goalStatus = goals.map(goal => {
      const achieved =
        (goal.linkedInvestments || [])
          .map(invId => {
            const inv = investments.find(i => i.id === invId);
            return inv ? inv.currentAmount : 0;
          })
          .reduce((a, b) => a + b, 0);
      const percent = goal.targetAmount > 0 ? (achieved / goal.targetAmount) * 100 : 0;
      return { goalId: goal.id, name: goal.name, percent: Math.round(percent), achieved };
    });

    return { totalPortfolio, roi, goalStatus };
  }, [investments, goals]);
}
