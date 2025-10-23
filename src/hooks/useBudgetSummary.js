// src/hooks/useBudgetSummary.js

import { useMemo } from "react";

/**
 * Hook analítico para gerar um resumo detalhado do orçamento anual,
 * incluindo saldo, percentuais mês a mês, e sugestão de gasto ideal futuro.
 *
 * @param {object} annualData - Retorno do useAnnualData (deve conter performanceByCategories)
 * @param {number} currentMonth - Mês atual (1-12)
 * @param {object} [filters] - Filtros opcionais: { typeId: string, onlyPositive: boolean, onlyNegative: boolean }
 * @returns {object} Resumo por categoria, onde cada categoria contém:
 *   annualBudget, realizadoTotal, restanteTotal, idealPorMesRestante, porcentagemRealizada,
 *   months: array detalhado ({ month, gasto, orcado, porcentagem })
 */
export default function useBudgetSummary(annualData, currentMonth, filters = {}) {
  return useMemo(() => {
    if (!annualData || !annualData.performanceByCategories) return {};

    // Calcula quantos meses faltam até o fim do ano (inclusive o atual)
    const remainingMonths = 12 - currentMonth + 1;
    const summary = {};

    Object.entries(annualData.performanceByCategories).forEach(([catId, data]) => {
      // Filtro: só inclui a categoria se o tipo confere (se solicitado)
      if (filters.typeId && data.typeId && data.typeId !== filters.typeId) return;
      // Filtro: só categorias com orçamento positivo ou negativo, se solicitado
      if (filters.onlyPositive && data.annualBudget <= 0) return;
      if (filters.onlyNegative && data.annualBudget >= 0) return;

      // Total realizado até o mês atual (somatório dos gastos/receitas já feitos no ano)
      const realizedSoFar =
        data.monthlyActuals?.slice(0, currentMonth).reduce((a, b) => a + b, 0) || 0;

      // Porcentagem realizada do orçamento anual
      const percentRealized = data.annualBudget
        ? (realizedSoFar / data.annualBudget) * 100
        : 0;

      // Saldo restante do orçamento para o ano
      const remaining = (data.annualBudget || 0) - realizedSoFar;

      // Gasto/receita ideal para os próximos meses
      const idealPerRemainingMonth =
        remainingMonths > 0 ? remaining / remainingMonths : 0;

      // Detalhamento por mês: compara orçado x realizado de janeiro a dezembro
      const months = Array.from({ length: 12 }, (_, i) => {
        const spent = data.monthlyActuals?.[i] || 0;
        const planned = (data.annualBudget || 0) / 12;
        const percent =
          planned !== 0 ? ((spent / planned) * 100) : 0;
        return {
          month: i + 1,
          spent,
          planned,
          percent: Math.round(percent),
        };
      });

      summary[catId] = {
        annualBudget: data.annualBudget,
        realizedTotal: realizedSoFar,
        remainingTotal: remaining,
        idealPerRemainingMonth,
        percentRealized: Math.round(percentRealized),
        months,
      };
    });

    return summary;
  }, [annualData, currentMonth, filters]);
}
