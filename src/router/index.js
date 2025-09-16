// File: src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/kelola-guru',
    name: 'kelola-guru',
    component: () => import('@/views/KelolaGuruView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/kelola-anak',
    name: 'kelola-anak',
    component: () => import('@/views/KelolaAnakView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/absensi-anak',
    name: 'absensi-anak',
    component: () => import('@/views/AbsensiAnakView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.user

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router