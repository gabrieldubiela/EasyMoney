// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ========================================
// CONFIGURAÇÃO (ajuste conforme necessário)
// ========================================
const APP_VERSION = '3.0.0' // ← Atualize manualmente
const IS_DEVELOPMENT = window.location.hostname === 'localhost'

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================
async function registerServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const { register } = await import('./services/serviceWorkerRegistration.js')
      
      await register({
        onSuccess: () => {
          console.log('✅ Service Worker registrado com sucesso')
        },
        onUpdate: () => {
          console.log('🆕 Nova versão disponível!')
        },
        onError: (error) => {
          console.warn('⚠️ Service Worker não pôde ser registrado:', error)
        }
      })
    } else {
      console.log('ℹ️ Service Workers não são suportados neste navegador')
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar Service Worker:', error)
    // Não quebrar a aplicação se o SW falhar
  }
}

// ========================================
// APP INITIALIZATION
// ========================================
async function initApp() {
  try {
    const container = document.getElementById('root')
    
    if (!container) {
      throw new Error('❌ Elemento #root não encontrado no DOM')
    }

    // Renderizar aplicação
    const root = createRoot(container)
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )

    console.log('✅ Aplicação renderizada com sucesso')

    // Registrar service worker após renderização
    registerServiceWorker()
    
  } catch (error) {
    console.error('❌ Erro crítico ao inicializar:', error)
    showErrorScreen(error)
  }
}

// ========================================
// ERROR SCREEN
// ========================================
function showErrorScreen(error) {
  const container = document.getElementById('root')
  
  if (!container) {
    console.error('Não foi possível exibir tela de erro: container não encontrado')
    return
  }

  // Detalhes do erro apenas em desenvolvimento
  const errorDetails = IS_DEVELOPMENT ? `
    <details style="
      text-align: left;
      margin-bottom: 24px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 12px;
      color: #666;
    ">
      <summary style="cursor: pointer; font-weight: 600; margin-bottom: 8px;">
        Detalhes do erro (desenvolvimento)
      </summary>
      <pre style="
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
      ">${error.message}\n${error.stack || ''}</pre>
    </details>
  ` : ''

  container.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column;
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    ">
      <div style="
        background: white;
        color: #333;
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 500px;
        width: 100%;
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">😕</div>
        <h1 style="
          color: #e74c3c; 
          margin-bottom: 16px;
          font-size: 24px;
          font-weight: 700;
        ">
          Ops! Algo deu errado
        </h1>
        <p style="
          color: #666; 
          margin-bottom: 24px;
          line-height: 1.6;
          font-size: 16px;
        ">
          Não conseguimos carregar o EasyMoney.<br>
          Tente recarregar a página ou limpar o cache.
        </p>
        ${errorDetails}
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button 
            onclick="window.location.reload()" 
            style="
              background: linear-gradient(135deg, #1bdd93 0%, #179e6a 100%);
              color: white; 
              border: none; 
              padding: 14px 32px; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(27, 221, 147, 0.3);
              transition: transform 0.2s, box-shadow 0.2s;
              width: 100%;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(27, 221, 147, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(27, 221, 147, 0.3)'"
          >
            🔄 Tentar Novamente
          </button>
          <button 
            onclick="localStorage.clear(); sessionStorage.clear(); if('caches' in window){caches.keys().then(keys => keys.forEach(key => caches.delete(key)));}; window.location.reload();" 
            style="
              background: transparent;
              color: #666; 
              border: 2px solid #ddd; 
              padding: 12px 24px; 
              border-radius: 8px; 
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
              transition: all 0.2s;
              width: 100%;
            "
            onmouseover="this.style.borderColor='#999'; this.style.color='#333'"
            onmouseout="this.style.borderColor='#ddd'; this.style.color='#666'"
          >
            🗑️ Limpar Cache Completo
          </button>
        </div>
      </div>
    </div>
  `
}

// ========================================
// INITIALIZE WHEN DOM IS READY
// ========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================

// Captura erros não tratados
window.addEventListener('error', (event) => {
  console.error('❌ Erro global capturado:', event.error)
})

// Captura promises rejeitadas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Promise rejeitada:', event.reason)
  event.preventDefault()
})

// ========================================
// ONLINE/OFFLINE DETECTION
// ========================================

window.addEventListener('online', () => {
  console.log('🌐 Conexão restaurada')
  // Opcional: mostrar notificação de online
})

window.addEventListener('offline', () => {
  console.log('📵 Sem conexão - modo offline')
  // Opcional: mostrar notificação de offline
})

// ========================================
// PERFORMANCE MONITORING (apenas dev)
// ========================================

if (IS_DEVELOPMENT) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    if (perfData) {
      console.log('⚡ Performance Metrics:')
      console.log(`  DOM Content Loaded: ${Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart)}ms`)
      console.log(`  Load Complete: ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`)
      console.log(`  Total Time: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`)
    }
  })
}

// ========================================
// STARTUP LOG
// ========================================

console.log(`
╔════════════════════════════════════╗
║   🚀 EasyMoney v${APP_VERSION}           ║
║   📅 ${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleTimeString('pt-BR')}  ║
║   🌍 ${navigator.onLine ? 'Online ✅' : 'Offline 📵'}              ║
║   🔧 ${IS_DEVELOPMENT ? 'Desenvolvimento 🛠️' : 'Produção 🏭'}    ║
╚════════════════════════════════════╝
`)
