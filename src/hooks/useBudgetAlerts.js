// src/hooks/useBudgetAlerts.js

import { useEffect, useRef } from 'react';
import { displayNotification } from '../utils/notification';

/**
 * Hook responsável por gerar alertas automáticos com base
 * no desempenho orçamentário (`performance`).
 *
 * - Avalia o percentual gasto e saldo restante por categoria.
 * - Emite notificações locais (via Notification API / PWA).
 * - Prioriza alertas máximos e intermediários conforme progresso de gastos.
 *
 * Observação:
 *   Este hook é executado somente quando há alteração relevante em `performance`.
 *   Funciona com o app aberto ou minimizado (não em modo fechado completamente).
 *
 * @param {object} performance - Objeto contendo métricas orçamentárias por categoria.
 * @returns {void}
 */
export default function useBudgetAlerts(performance) {
  const alertedCategories = useRef(new Set()); 
  // evita alertas repetidos consecutivos, armazenando IDs já notificados

  useEffect(() => {
    // Bloqueia execução se dados inválidos
    if (!performance || Object.keys(performance).length === 0) return;

    const alertMessages = [];

    // Itera pelas categorias e aplica regras de alerta
    Object.values(performance).forEach((item) => {
      // Apenas categorias de despesa com orçamento definido
      if (!item.categoryId || item.totalAvailable <= 0 || item.type?.isIncome) return;

      const percentSpent = Math.abs(item.realSpent) / item.totalAvailable;
      const remainingPercent = item.remaining / item.totalAvailable;
      const alreadyNotified = alertedCategories.current.has(item.categoryId);

      let message = null;

      // ⚠️ Alerta máximo: orçamento excedido
      if (item.isOverBudget && !alreadyNotified) {
        message = `⚠️ ${item.categoryName}: limite de R$ ${item.totalAvailable.toFixed(
          2
        )} ultrapassado em R$ ${Math.abs(item.remaining).toFixed(2)}.`;
      }

      // 🟠 Alerta intermediário: próximo ao limite
      else if (remainingPercent > 0 && remainingPercent < 0.2 && !alreadyNotified) {
        message = `🟠 ${item.categoryName}: restam apenas R$ ${item.remaining.toFixed(
          2
        )} (${(remainingPercent * 100).toFixed(0)}%).`;
      }

      // 🟡 Alerta leve: meio do orçamento
      else if (
        percentSpent >= 0.5 &&
        percentSpent < 0.85 &&
        !alreadyNotified
      ) {
        message = `🟡 ${item.categoryName}: gasto de R$ ${Math.abs(
          item.realSpent
        ).toFixed(2)} (${(percentSpent * 100).toFixed(0)}% do limite de R$ ${item.totalAvailable.toFixed(
          2
        )}).`;
      }

      // Registra e adiciona à lista caso tenha alerta
      if (message) {
        alertMessages.push(message);
        alertedCategories.current.add(item.categoryId);
      }
    });

    // Exibe a notificação consolidada se houver mensagens novas
    if (alertMessages.length > 0) {
      const body = alertMessages.join('\n');
      displayNotification('Alerta de Orçamento!', body, {
        tag: 'budget-alert',
        renotify: true,
      });
    }
  }, [performance]);
}
