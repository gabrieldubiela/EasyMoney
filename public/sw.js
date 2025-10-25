// public/sw.js

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `easymoney-${CACHE_VERSION}`;

const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

console.log(`SW: Iniciado - ${CACHE_VERSION}`);

// ========================================
// INSTALAÇÃO
// ========================================

self.addEventListener('install', (event) => {
  console.log(`SW: Instalando ${CACHE_VERSION}...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache criado');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('SW: Arquivos cacheados com sucesso');
        // skipWaiting para ativar imediatamente
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Erro na instalação:', error);
        // Instalar mesmo com erro de cache
        return self.skipWaiting();
      })
  );
});

// ========================================
// ATIVAÇÃO
// ========================================

self.addEventListener('activate', (event) => {
  console.log(`SW: Ativando ${CACHE_VERSION}...`);
  
  event.waitUntil(
    Promise.all([
      // Toma controle de todas as páginas imediatamente
      self.clients.claim(),
      
      // Limpa caches antigos
      caches.keys().then(keys => 
        Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              console.log('SW: Removendo cache antigo:', key);
              return caches.delete(key);
            }
          })
        )
      )
    ]).then(() => {
      console.log(`SW: ${CACHE_VERSION} ativado e controlando páginas`);
      
      // Notifica todas as páginas abertas sobre a nova versão
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// ========================================
// FETCH - Estratégia Network First
// ========================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar assets, JS, CSS, Firebase e métodos não-GET
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') ||
      url.pathname.includes('firebase') ||
      url.pathname.includes('firestore') ||
      url.pathname.includes('api/') ||
      event.request.method !== 'GET') {
    return; // Navegador lida normalmente
  }

  // Apenas para navegação HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache a resposta válida
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('SW: Offline - usando cache');
          return caches.match('/index.html')
            .then(cached => cached || new Response('Offline', { status: 503 }));
        })
    );
  }
});

// ========================================
// MENSAGENS - Comunicação com a página
// ========================================

self.addEventListener('message', (event) => {
  console.log('SW: Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Skip waiting ativado manualmente');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION
    });
  }
});

// ========================================
// NOTIFICAÇÃO DE ERRO (opcional)
// ========================================

self.addEventListener('error', (event) => {
  console.error('SW: Erro global:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Promise rejeitada:', event.reason);
});

console.log(`SW: Arquivo carregado - ${CACHE_VERSION}`);
