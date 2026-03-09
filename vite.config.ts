import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src/frontend'),
  
  // Настройки сервера разработки
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
  
  // Оптимизированная сборка для production
  build: {
    outDir: resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true,
    
    // Минификация (esbuild - быстро и эффективно)
    minify: 'esbuild',
    
    // Разделение чанков для лучшего кэширования
    rollupOptions: {
      output: {
        // Имена файлов с хэшем для кэширования
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Source maps для отладки в production
    sourcemap: false,
    
    // Целевые браузеры
    target: 'es2020',
    
    // Размер предупреждения о чанке
    chunkSizeWarningLimit: 500,
  },
  
  // Оптимизация зависимостей
  optimizeDeps: {
    include: [],
  },
  
  // Переменные окружения
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
