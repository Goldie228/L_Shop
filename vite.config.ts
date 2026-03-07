import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src/frontend'),
  server: {
    port: 3002,
    strictPort: true, // Падать с ошибкой если порт занят, а не переключаться
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true
  }
});