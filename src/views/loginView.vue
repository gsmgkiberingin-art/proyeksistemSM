<script setup>
// File: src/views/LoginView.vue
// Tujuan: Halaman login. Dengan sintaksis yang sudah diperbaiki.

import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Berhasil login:', result.user.displayName);
    router.push({ name: 'dashboard' });
  } catch (error) {
    console.error('Gagal login dengan Google:', error);
    alert('Login gagal. Silakan coba lagi.');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
      
      <div class="mb-8">
        <svg class="w-20 h-20 text-teal-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
        <h1 class="text-3xl font-bold text-gray-800 mt-4">Aplikasi Sekolah Minggu</h1>
        <p class="text-gray-500 mt-2">Silakan masuk untuk melanjutkan</p>
      </div>

      <button @click="handleGoogleLogin" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-md">
        <!-- SVG Ikon Google -->
        <svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
        </svg> 
        <!-- Tag penutup SVG ada di atas, teks ini sekarang di luar SVG -->
        Masuk dengan Google
      </button>

      <div class="mt-8 text-sm text-gray-400">
        &copy; 2025 Komunitas Sekolah Minggu
      </div>
    </div>
  </div>
</template>