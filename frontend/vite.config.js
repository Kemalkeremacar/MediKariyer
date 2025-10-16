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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
        },
      },
    },
  },
})
