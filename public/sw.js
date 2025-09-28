// Service Worker compatível com Chrome e Samsung Internet
const CACHE_NAME = 'easymoney-v3';
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

console.log('SW: Iniciado - Versão 3');

// Instalação
self.addEventListener('install', (event) => {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache criado');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('SW: Arquivos cacheados');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Erro na instalação:', error);
        return self.skipWaiting(); // Instalar mesmo com erro
      })
  );
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('SW: Ativando...');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Limpar caches antigos
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
    ])
  );
});

// Fetch - Estratégia simples e compatível
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar completamente assets e APIs
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') ||
      url.pathname.includes('firebase') ||
      event.request.method !== 'GET') {
    return; // Deixar o navegador lidar
  }

  // Apenas para navegação de páginas HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('SW: Usando fallback offline');
          return caches.match('/index.html');
        })
    );
  }
});