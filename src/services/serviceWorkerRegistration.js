// src/services/serviceWorkerRegistration.js 

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.0/8 are considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator && (isLocalhost || window.location.protocol === 'https:')) {
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

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}