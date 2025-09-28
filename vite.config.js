import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Remover o base: './' que pode causar problemas
  // base: './', 
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
})