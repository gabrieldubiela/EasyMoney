// src/services/serviceWorkerRegistration.js

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if ('serviceWorker' in navigator && (isLocalhost || window.location.protocol === 'https:')) {
    const swUrl = '/sw.js';

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('✅ Service Worker registrado');

          // ========================================
          // VERIFICA ATUALIZAÇÕES A CADA 1 HORA
          // ========================================
          setInterval(() => {
            registration.update();
            console.log('🔍 Verificando atualizações...');
          }, 3600000);

          // ========================================
          // DETECTA NOVA VERSÃO
          // ========================================
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🆕 Nova versão encontrada!');

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('⚡ Nova versão pronta!');
                
                // Callback customizado
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                } else {
                  // Notificação padrão
                  showUpdateAlert(registration);
                }
              }
            });
          });

          // ========================================
          // ESCUTA MENSAGENS DO SERVICE WORKER
          // ========================================
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_ACTIVATED') {
              console.log('🎉 Service Worker ativado:', event.data.version);
            }
          });

          if (config && config.onSuccess) {
            config.onSuccess(registration);
          }
        })
        .catch(error => {
          console.error('❌ Erro no Service Worker:', error);
          if (config && config.onError) {
            config.onError(error);
          }
        });
    });

    // ========================================
    // AUTO-RELOAD QUANDO NOVA VERSÃO ATIVAR
    // ========================================
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      console.log('🔄 Nova versão ativada - recarregando...');
      window.location.reload();
    });
  }
}

// ========================================
// ALERTA DE ATUALIZAÇÃO SIMPLES
// ========================================
function showUpdateAlert(registration) {
  // Remove alerta anterior
  const existing = document.getElementById('update-alert');
  if (existing) existing.remove();

  // Cria alerta
  const alert = document.createElement('div');
  alert.id = 'update-alert';
  alert.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #1bdd93;
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 90vw;
    animation: slideUp 0.3s ease-out;
    font-family: 'Inter', sans-serif;
  `;

  alert.innerHTML = `
    <div style="flex: 1;">
      <div style="font-weight: 600; margin-bottom: 4px;">🚀 Nova versão disponível!</div>
      <div style="font-size: 14px; opacity: 0.9;">Clique para atualizar agora</div>
    </div>
    <button id="update-btn" style="
      background: white;
      color: #1bdd93;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    ">Atualizar</button>
  `;

  // Adiciona animação
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateX(-50%) translateY(100px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(alert);

  // Botão de atualizar
  document.getElementById('update-btn').addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    alert.remove();
  });

  // Remove após 30 segundos
  setTimeout(() => {
    if (alert.parentNode) alert.remove();
  }, 30000);
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
        console.log('🗑️ Service Worker desregistrado');
      })
      .catch(error => {
        console.error('❌ Erro ao desregistrar:', error);
      });
  }
}

// Função extra: verificar atualização manualmente
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => reg.update());
  }
}
