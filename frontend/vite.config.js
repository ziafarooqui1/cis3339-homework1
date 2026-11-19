import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  server: {
    proxy: {
      '/find-student': 'http://localhost:3000',
      '/add-student': 'http://localhost:3000',
      '/delete-student': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
