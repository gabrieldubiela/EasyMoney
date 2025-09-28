import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Função para registrar o service worker com tratamento de erro
async function registerServiceWorker() {
  try {
    // Registrar em produção, ou em desenvolvimento se forçado
    if ('serviceWorker' in navigator) {
      const { register } = await import('./services/serviceWorkerRegistration.js')
      
      await register({
        onSuccess: (registration) => {
          console.log('Service Worker registrado com sucesso:', registration)
        },
        onError: (error) => {
          console.warn('Erro no Service Worker:', error)
        }
      })
    }
  } catch (error) {
    console.warn('Erro ao registrar Service Worker:', error)
    // Não quebrar a aplicação se o SW falhar
  }
}

// Função principal de inicialização
async function initApp() {
  try {
    const container = document.getElementById('root')
    if (!container) {
      throw new Error('Elemento root não encontrado')
    }

    const root = createRoot(container)
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )

    // Registrar service worker após renderizar a app
    registerServiceWorker()
    
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error)
    
    // Renderizar uma mensagem de erro amigável
    const container = document.getElementById('root')
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
          background-color: #f5f5f5;
        ">
          <div>
            <h1 style="color: #e74c3c; margin-bottom: 20px;">Erro ao carregar a aplicação</h1>
            <p style="color: #666; margin-bottom: 20px;">Ocorreu um problema ao inicializar o EasyMoney.</p>
            <button 
              onclick="window.location.reload()" 
              style="
                background-color: #007bff; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 16px;
              "
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      `
    }
  }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}