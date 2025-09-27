// src/hooks/useScheduledPayments.js

import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { useHousehold } from '../context/useHousehold';
import { displayNotification } from '../utils/notification';
import { format } from 'date-fns'; 

const useScheduledPayments = () => {
    const { householdId } = useHousehold();
    // ... (Estados e useEffect de busca, como no monthlybalance.js)
    
    // ... (Restante do código do hook)

    // LÓGICA CENTRAL DE ALERTA DE VENCIMENTO
    const checkForDueAlerts = (paymentsList) => {
        // Se a lista estiver vazia, não faz nada
        if (paymentsList.length === 0) return; 

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1); // Calcula amanhã

        // Formatos de string para comparação de data (ignora a hora)
        const todayDateString = format(today, 'yyyy-MM-dd');
        const tomorrowDateString = format(tomorrow, 'yyyy-MM-dd');

        const dueAlerts = [];

        paymentsList.forEach(payment => {
            // Converte a data de vencimento do Firestore para o formato de comparação
            const dueDateString = format(payment.date.toDate(), 'yyyy-MM-dd');

            if (dueDateString === todayDateString) {
                dueAlerts.push(`🔴 ${payment.description} (R$ ${payment.amount.toFixed(2)}) vence HOJE!`);
            } else if (dueDateString === tomorrowDateString) {
                dueAlerts.push(`🟡 ${payment.description} (R$ ${payment.amount.toFixed(2)}) vence AMANHÃ.`);
            }
        });

        if (dueAlerts.length > 0) {
            const bodyMessage = dueAlerts.join('\n');
            displayNotification('🚨 Contas a Vencer', bodyMessage, {
                tag: 'bill-due-alert',
                renotify: true,
                vibrate: [200, 100, 200]
            });
        }
    };

    // A lógica de busca real e a chamada de checkForDueAlerts está contida aqui
    useEffect(() => {
        if (!householdId) return;

        // Buscamos transações PLANEJADAS, que são as que precisam de alerta
        const paymentsRef = collection(db, `households/${householdId}/plannedTransactions`);
        // Filtrar apenas o que tem que ser pago (opcionalmente: no futuro próximo)
        const q = query(paymentsRef, where('paymentDate', '>=', new Date())); 

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const paymentsList = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                date: doc.data().paymentDate, // Usar 'paymentDate' para planejado
            }));
            
            // Dispara a lógica de alerta imediatamente após buscar os dados
            checkForDueAlerts(paymentsList);
        });

        return () => unsubscribe();
    }, [householdId]);

    // Este hook não retorna nada, apenas executa o side effect de notificação.
    return null; 
};

export default useScheduledPayments;