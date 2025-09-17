// File: src/router/index.js (Versi Final & Aman)
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { requiresAuth: false } },
  { path: '/dashboard', name: 'dashboard', component: () => import('@/views/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/kelola-guru', name: 'kelola-guru', component: () => import('@/views/KelolaGuruView.vue'), meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/kelola-anak', name: 'kelola-anak', component: () => import('@/views/KelolaAnakView.vue'), meta: { requiresAuth: true, requiredRole: 'admin' } },
  { path: '/absensi-anak', name: 'absensi-anak', component: () => import('@/views/AbsensiAnakView.vue'), meta: { requiresAuth: true, requiredRole: 'guru' } }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

const waitForAuthInit = async () => {
  const authStore = useAuthStore();
  if (!authStore.isAuthReady) {
    await authStore.monitorAuthState();
  }
};

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await waitForAuthInit(); // Selalu pastikan auth sudah siap
  
  const isLoggedIn = !!authStore.user;
  const userRole = authStore.userInfo?.role;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'dashboard' });
  } else if (to.meta.requiredRole) {
    // Jika rute butuh peran spesifik, cek di sini
    let hasAccess = false;
    const requiredRole = to.meta.requiredRole;

    if (requiredRole === 'admin') {
      hasAccess = userRole === 'admin';
    } else if (requiredRole === 'guru') {
      hasAccess = ['admin', 'wali_kelas', 'guru'].includes(userRole);
    }
    
    if (hasAccess) {
      next(); // Izinkan
    } else {
      alert('Anda tidak memiliki hak akses untuk halaman ini.');
      next({ name: 'dashboard' }); // Tolak
    }
  } else {
    // Untuk rute yang butuh login tapi tanpa peran spesifik (seperti dasbor)
    next();
  }
});

export default router;