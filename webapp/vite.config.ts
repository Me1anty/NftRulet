import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'tlxvwl-2a09-bac1-61e0-38--57-23c.ru.tuna.am',
      // Добавь сюда другие туннельные адреса, если нужно
    ],
  },
})
