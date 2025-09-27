import { displayNotification } from '../utils/notification';

useEffect(() => {
    // 5. LÓGICA DE ALERTA DE ORÇAMENTO (NOVO CÓDIGO)
            const item = newPerformance[catId];
            
            // Só monitoramos categorias de DESPESA que têm uma meta (> 0)
            if (!item.type?.isIncome && item.totalGoal > 0) {
                const percentSpent = item.realSpent / item.totalGoal;
                const remainingPercent = item.remaining / item.totalGoal;

                // ⚠️ Alerta MÁXIMO: Gasto Excedido (> 100%)
                if (item.isOverBudget) { 
                    alertMessages.push(`⚠️ ${item.categoryName}: Limite de R$ ${item.totalGoal.toFixed(2)} ultrapassado em R$ ${Math.abs(item.remaining).toFixed(2)}.`);
                } 
                // 🟠 Alerta INTERMEDIÁRIO: Próximo ao Limite (entre 80% e 100%)
                else if (remainingPercent > 0 && remainingPercent < 0.2) {
                    alertMessages.push(`🟠 ${item.categoryName}: Restam apenas R$ ${item.remaining.toFixed(2)} (${(remainingPercent * 100).toFixed(0)}%).`);
                } 
                // 🟡 NOVO ALERTA: Meio do Orçamento (acima de 50% e não próximo ao limite)
                else if (percentSpent >= 0.50 && percentSpent < 0.85) { 
                     // O alerta só é emitido uma vez (e atualizado) para o 50%
                     alertMessages.push(`🟡 ${item.categoryName}: Você já gastou R$ ${item.realSpent.toFixed(2)}, atingindo ${(percentSpent * 100).toFixed(0)}% do limite de R$ ${item.totalGoal.toFixed(2)}.`);
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