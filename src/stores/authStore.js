// File: src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '@/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import router from '@/router'; // Menggunakan alias

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const isAuthReady = ref(false);

  const monitorAuthState = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
        // Hanya resolve saat pertama kali status auth siap
        if (!isAuthReady.value) {
          isAuthReady.value = true;
          resolve();
        }
      });
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push({ name: 'login' });
    } catch (error) {
      console.error('Gagal melakukan logout:', error);
    }
  };

  return {
    user,
    isAuthReady,
    monitorAuthState,
    handleLogout
  };
});