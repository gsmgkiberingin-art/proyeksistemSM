// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { URL, fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Server dikembalikan ke mode paling sederhana
  server: {
    // Kosongkan bagian ini untuk kembali ke default
  }
})