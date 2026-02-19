import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src/frontend'),
  server: {
    port: 3002,
    open: true
  },
  build: {
    outDir: resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true
  }
});