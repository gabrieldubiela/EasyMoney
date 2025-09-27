// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { register } from './services/serviceWorkerRegistration'; // Importe o registro

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// CHAME A FUNÇÃO DE REGISTRO DO PWA
// NOTA: Os PWAs só funcionam em HTTPS ou localhost
register();