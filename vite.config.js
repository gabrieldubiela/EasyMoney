// vite.config.js

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// O defineConfig agora recebe uma função para acessar o 'mode' e o 'command'
export default defineConfig(({ mode }) => {
  // 1. Carregar as variáveis de ambiente
  // O terceiro argumento '' garante que todas as variáveis (incluindo as não prefixadas)
  // sejam carregadas, mas focaremos no VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  return {
    plugins: [react()],
    
    // 2. INJETAR VARIÁVEIS NA CONFIGURAÇÃO (O passo crucial para o build)
    define: {
      // Injeta todas as chaves VITE_ do arquivo .env como strings no build final.
      // Isso corrige o erro de 'invalid-api-key' em produção.
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID),
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'vendor-react';
              }
              return 'vendor';
            }
          },
          // Garantir nomes consistentes para os chunks
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
    },
    // Configuração do servidor de desenvolvimento
    server: {
      port: 3000,
      open: true,
      cors: true
    },
    // Configuração para preview
    preview: {
      port: 4173,
      open: true
    }
  }
});