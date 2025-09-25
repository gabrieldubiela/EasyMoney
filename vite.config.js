// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Aumenta o limite do aviso para 1MB (opcional, mas evita avisos futuros)
    chunkSizeWarningLimit: 1000, 
    
    // 2. Configurações avançadas do Rollup para divisão manual
    rollupOptions: {
      output: {
        // Define regras para criar arquivos separados (chunks)
        manualChunks(id) {
          
          // CRIA CHUNK SEPARADO PARA O FIREBASE
          // Tudo que for importado da pasta 'firebase' ou do sdk do firebase
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          
          // CRIA CHUNK PARA OUTRAS DEPENDÊNCIAS (vendor)
          // Tudo que vier da pasta node_modules (exceto o que já separamos)
          if (id.includes('node_modules')) {
            // Separa 'react' e 'react-dom' para um cache mais eficiente, 
            // se o Vite não fizer isso automaticamente.
            if (id.includes('react')) {
                return 'vendor-react';
            }
            return 'vendor'; 
          }
        },
      },
    },
  },
})