// src/utils/notification.js

// 1. Solicita a permissão do usuário para enviar notificações
export const requestNotificationPermission = () => {
    // Verifica se o navegador suporta o recurso
    if (!('Notification' in window)) {
        console.warn('Este navegador não suporta notificações de desktop.');
        return;
    }

    // Se a permissão não foi negada, solicita ao usuário
    if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permissão de notificação concedida.');
                displayNotification('Seu Orçamento', 'As notificações agora estão ativas!', {
                    body: 'Vamos te avisar sobre contas a pagar e limites de gastos.'
                });
            }
        });
    }
};

// 2. Exibe uma notificação, preferencialmente via Service Worker
export const displayNotification = (title, body, options = {}) => {
    if (Notification.permission === 'granted') {
        // Envia a notificação usando o Service Worker
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'NOTIFICATION',
                title: title,
                body: body,
                options: options
            });
        } else {
            // Fallback: Exibe a notificação diretamente se o SW não estiver ativo
            new Notification(title, { body, ...options });
        }
    } else {
        console.warn('Permissão de notificação negada ou não concedida.');
    }
};