// File: src/main.js
import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'

// Buat instance aplikasi dan Pinia
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Inisialisasi store SETELAH Pinia di-install
const authStore = useAuthStore()

// Tunggu status otentikasi siap SEBELUM me-mount router dan aplikasi
authStore.monitorAuthState().then(() => {
  app.use(router)
  app.mount('#app')
})