// src/hooks/useBudgetAlerts.js

import { useEffect } from 'react';
import { displayNotification } from '../utils/notification';

const useBudgetAlerts = (performance) => {
    useEffect(() => {
        if (!performance || Object.keys(performance).length === 0) return;

        const alertMessages = [];

        Object.values(performance).forEach(item => {
            if (!item.type?.isIncome && item.totalAvailable > 0) {
                const percentSpent = Math.abs(item.realSpent) / item.totalAvailable;
                const remainingPercent = item.remaining / item.totalAvailable;

                // ⚠️ Alerta MÁXIMO: Gasto Excedido (> 100%)
                if (item.isOverBudget) { 
                    alertMessages.push(`⚠️ ${item.categoryName}: Limite de R$ ${item.totalAvailable.toFixed(2)} ultrapassado em R$ ${Math.abs(item.remaining).toFixed(2)}.`);
                } 
                // 🟠 Alerta INTERMEDIÁRIO: Próximo ao Limite (entre 80% e 100%)
                else if (remainingPercent > 0 && remainingPercent < 0.2) {
                    alertMessages.push(`🟠 ${item.categoryName}: Restam apenas R$ ${item.remaining.toFixed(2)} (${(remainingPercent * 100).toFixed(0)}%).`);
                } 
                // 🟡 NOVO ALERTA: Meio do Orçamento (acima de 50% e não próximo ao limite)
                else if (percentSpent >= 0.50 && percentSpent < 0.85) { 
                     alertMessages.push(`🟡 ${item.categoryName}: Você já gastou R$ ${Math.abs(item.realSpent).toFixed(2)}, atingindo ${(percentSpent * 100).toFixed(0)}% do limite de R$ ${item.totalAvailable.toFixed(2)}.`);
                }
            }
        });

        // Dispara a notificação final se houver alertas
        if (alertMessages.length > 0) {
            const bodyMessage = alertMessages.join('\n');
            displayNotification('Alerta de Orçamento!', bodyMessage, {
                // Garante que a notificação se atualize
                tag: 'budget-alert', 
                renotify: true 
            });
        }
    }, [performance]);
};

export default useBudgetAlerts;