import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Locally, Vite forwards /api to Fastify, the same way IIS does on the server.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:3000' }
  },
  preview: {
    port: 4173,
    proxy: { '/api': 'http://127.0.0.1:3000' }
  }
})
