// src/hooks/useRealtimeAlertManager.js

import { useEffect } from 'react';
import { displayNotification } from '../utils/notification';
import useAllAlerts from './useAllAlerts';
import useAllBudgets from './useAllBudgets';
import useAllCategories from './useAllCategories';
import useAllTypes from './useAllTypes';
import useMonthlyPerformanceData from './useMonthlyPerformanceData';
import useAllPlannedTransactions from './useAllPlannedTransactions';
import { useAppContext } from '../context/useAppContext';

/**
 * Hook central de monitoramento de alertas do EasyMoney.
 *
 * - Observa budgets, alerts, performance e transações planejadas.
 * - Executa automaticamente a lógica de cada tipo de alerta configurado:
 *    * Limite percentual do orçamento (transferPercentage)
 *    * Orçamento excedido (budgetExceeded)
 *    * Saldo crítico (lowBalance)
 *    * Transações planejadas próximas do vencimento (plannedTransaction)
 * - Dispara notificações locais (funciona em PWA ativo ou background).
 */
const useRealtimeAlertManager = ({ selectedYear, yearMonth, annualData }) => {
  const { householdId } = useAppContext();

  // Dados base
  const { budgets } = useAllBudgets(selectedYear);
  const { categories } = useAllCategories();
  const { types } = useAllTypes();

  // Alertas ativos
  const { alerts } = useAllAlerts({ status: 'active' });

  // Performance mensal consolidada
  const { performance } = useMonthlyPerformanceData({
    yearMonth,
    annualData,
    categories,
    types,
  });

  // Transações planejadas (para avisos de vencimento)
  const { transactions: plannedTransactions } = useAllPlannedTransactions();

  useEffect(() => {
    if (!householdId || !alerts || alerts.length === 0) return;

    /** -------------------------------------------
     * 1. ALERTAS DE ORÇAMENTO (performance mensal)
     * ------------------------------------------- */
    if (performance && Object.keys(performance).length > 0) {
      alerts.forEach((alert) => {
        const categoryPerf = performance[alert.categoryId];
        if (!categoryPerf) return;

        const percentUsed =
          Math.abs(categoryPerf.realSpent) / categoryPerf.totalAvailable;
        const remainingPercent =
          categoryPerf.remaining / categoryPerf.totalAvailable;

        // Alerta de gasto por percentual atingido
        if (
          alert.alertType === 'transferPercentage' &&
          percentUsed >= alert.percentageThreshold / 100 &&
          percentUsed < (alert.percentageThreshold + 5) / 100
        ) {
          displayNotification(
            '⚠️ Alerta de Gasto!',
            `${categoryPerf.categoryName}: ${Math.round(
              percentUsed * 100
            )}% do orçamento utilizado.`,
            { tag: `percent-${alert.id}`, renotify: true }
          );
        }

        // Alerta de orçamento excedido
        if (alert.alertType === 'budgetExceeded' && categoryPerf.isOverBudget) {
          displayNotification(
            '🚨 Orçamento Estourado',
            `${categoryPerf.categoryName}: limite de R$ ${categoryPerf.totalAvailable.toFixed(
              2
            )} ultrapassado.`,
            { tag: `overbudget-${alert.id}`, renotify: true }
          );
        }

        // Alerta de saldo restante crítico
        if (
          alert.alertType === 'lowBalance' &&
          remainingPercent > 0 &&
          remainingPercent < alert.remainingThreshold / 100
        ) {
          displayNotification(
            '🟠 Orçamento quase no fim',
            `${categoryPerf.categoryName}: resta R$ ${categoryPerf.remaining.toFixed(
              2
            )} (${Math.round(remainingPercent * 100)}%).`,
            { tag: `lowbalance-${alert.id}`, renotify: true }
          );
        }
      });
    }

    /** -------------------------------------------
     * 2. ALERTAS DE TRANSAÇÕES PLANEJADAS (vencimentos)
     * ------------------------------------------- */
    if (alerts.some((a) => a.alertType === 'plannedTransaction')) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Percorre alertas para buscar os que se aplicam
      alerts
        .filter((a) => a.alertType === 'plannedTransaction')
        .forEach((alert) => {
          // Filtro opcional: triggerDay (0 = hoje, 1 = amanhã)
          const triggerDay = alert.triggerDay ?? 0;
          const referenceDate = new Date(today);
          referenceDate.setDate(today.getDate() + triggerDay);
          const refStr = referenceDate.toISOString().split('T')[0];

          const duePayments = plannedTransactions.filter((p) => {
            if (!p.date) return false;
            const payDate = p.date.toDate
              ? p.date.toDate()
              : p.date;
            const payStr = payDate.toISOString().split('T')[0];
            return payStr === refStr;
          });

          if (duePayments.length > 0) {
            const body = duePayments
              .map(
                (p) =>
                  `• ${p.description} (R$ ${p.amount.toFixed(2)}) vence ${
                    triggerDay === 0
                      ? 'HOJE'
                      : triggerDay === 1
                      ? 'AMANHÃ'
                      : `em ${triggerDay} dias`
                  }.`
              )
              .join('\n');

            displayNotification('📅 Contas a Vencer', body, {
              tag: `planned-${alert.id}`,
              renotify: true,
              vibrate: [200, 100, 200],
            });
          }
        });
    }
  }, [alerts, performance, plannedTransactions, budgets]);
};

export default useRealtimeAlertManager;
