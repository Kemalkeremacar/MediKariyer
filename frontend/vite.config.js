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
        manualChunks: (id) => {
          // node_modules içindeki paketleri ayır
          if (id.includes('node_modules')) {
            // React core - en büyük paket
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // React Query - büyük paket
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // UI kütüphaneleri
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('sonner')) {
              return 'vendor-ui';
            }
            // Zustand
            if (id.includes('zustand')) {
              return 'vendor-state';
            }
            // Axios
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            // Diğer vendor paketleri
            return 'vendor-other';
          }
        },
      },
    },
    // Chunk boyutu uyarısı için limit artırıldı (500 KB yerine 600 KB)
    chunkSizeWarningLimit: 600,
  },
})
