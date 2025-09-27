// public/service-worker.js

const CACHE_NAME = 'my-budget-app-cache-v1';
const urlsToCache = [
  '/', // Cacha a raiz
  '/index.html',
  '/icons/icon-512x512.png',
  // Adicione todos os seus arquivos JS/CSS importantes aqui após o build!
  // Em uma configuração sem CRA, você precisará atualizar esta lista manualmente
  // ou usar uma ferramenta de build como Webpack para gerar esta lista.
];

// Instalação: Cachea todos os ativos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        return cache.addAll(urlsToCache);
      })
  );
});

// Busca: Serve o recurso do cache ou da rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o recurso estiver no cache, retorna
        if (response) {
          return response;
        }
        // Se não estiver, busca na rede
        return fetch(event.request);
      })
  );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'NOTIFICATION') {
    const { title, body, options } = event.data;
    
    // O Service Worker exibe a notificação
    self.registration.showNotification(title, {
      body: body,
      icon: '/icons/icon-192x192.png', // Ajuste para o caminho do seu ícone
      // Usamos tag e renotify para que a notificação se acumule/atualize
      ...options
    });
  }
});