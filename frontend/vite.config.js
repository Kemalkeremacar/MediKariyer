import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
  optimizeDeps: {
    include: ['lucide-react', 'axios', 'react-router-dom'],
  },
  server: {
    port: 5000,       // 👈 Frontend 5000 portunda çalışacak
    host: true,       // Network erişimi için
  },
  build: {
    // Vite/Rollup'un kendi chunk bölme stratejisini kullan
    // chunkSizeWarningLimit: 600,
    minify: 'esbuild', // Vite'ın varsayılan minifier'ı
  },
  esbuild: {
    drop: ['console', 'debugger'], // Production build'de console ve debugger'ları kaldır
  },
})
