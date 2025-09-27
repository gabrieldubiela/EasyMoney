// src/serviceWorkerRegistration.js (CORRIGIDO)

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.0/8 are considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

// NOTA: Para fins de PWA, assumimos que o Service Worker deve ser registrado
// apenas em ambientes seguros (localhost ou HTTPS), que é a exigência do navegador.

export function register(config) {
  // Mudamos a verificação para 'production' (que causava o erro)
  // O Service Worker só será registrado em localhost ou se a página estiver em HTTPS.
  if ('serviceWorker' in navigator && isLocalhost) {
    
    // Você pode precisar ajustar 'PUBLIC_URL' dependendo de como você faz o build.
    // Se o service-worker.js estiver na raiz da sua aplicação, use '/service-worker.js'.
    const swUrl = '/service-worker.js'; 

    window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(swUrl)
          .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
            if (config && config.onSuccess) {
                config.onSuccess(registration);
            }
          })
          .catch(error => {
            console.error('Erro durante o registro do Service Worker:', error);
            if (config && config.onError) {
                config.onError(error);
            }
          });
    });
  }
}