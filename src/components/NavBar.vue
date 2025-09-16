<script setup>
// File: src/components/Navbar.vue
// Tujuan: Komponen bilah navigasi utama yang digunakan di seluruh aplikasi.
// Versi ini sudah responsif dengan menu mobile.

import { ref } from 'vue';
import { RouterLink } from 'vue-router';
// PERBAIKAN: Path impor ke authStore diperbaiki.
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();

// State untuk mengontrol visibilitas menu di perangkat mobile
const isMobileMenuOpen = ref(false);

const handleLogout = () => {
  // Tutup menu mobile jika terbuka saat logout
  isMobileMenuOpen.value = false;
  authStore.handleLogout();
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
}
</script>

<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-3">
      <div class="flex justify-between items-center">
        <!-- Logo dan Nama Aplikasi -->
        <RouterLink to="/dashboard" @click="closeMobileMenu" class="flex items-center space-x-2">
          <svg class="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
          <span class="text-xl font-bold text-gray-800">Aplikasi SM</span>
        </RouterLink>

        <!-- Menu Navigasi (Desktop) -->
        <div class="hidden md:flex items-center space-x-6">
          <RouterLink to="/dashboard" class="text-gray-600 hover:text-teal-500 transition-colors font-medium" active-class="text-teal-500">Dasbor</RouterLink>
          <RouterLink to="/kelola-guru" class="text-gray-600 hover:text-teal-500 transition-colors font-medium" active-class="text-teal-500">Kelola Guru</RouterLink>
          <RouterLink to="/kelola-anak" class="text-gray-600 hover:text-teal-500 transition-colors font-medium" active-class="text-teal-500">Kelola Anak</RouterLink>
          <RouterLink to="/absensi-anak" class="text-gray-600 hover:text-teal-500 transition-colors font-medium" active-class="text-teal-500">Absensi Anak</RouterLink>
        </div>

        <!-- Info Pengguna dan Tombol Logout (Desktop) -->
        <div v-if="authStore.user" class="hidden md:flex items-center space-x-4">
          <div class="text-right">
            <p class="text-sm font-medium text-gray-800">Halo, {{ authStore.user.displayName }}</p>
            <p class="text-xs text-gray-500">{{ authStore.user.email }}</p>
          </div>
          <img :src="authStore.user.photoURL" alt="Foto Profil" class="w-10 h-10 rounded-full">
          <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Logout
          </button>
        </div>

        <!-- Tombol Hamburger Menu (Mobile) -->
        <div class="md:hidden">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-600 hover:text-teal-500 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Dropdown Menu (Mobile) -->
      <div v-if="isMobileMenuOpen" class="md:hidden mt-4">
        <div class="flex flex-col space-y-2">
            <RouterLink @click="closeMobileMenu" to="/dashboard" class="block py-2 px-4 text-gray-600 hover:bg-teal-50 rounded-lg" active-class="bg-teal-100 text-teal-600 font-semibold">Dasbor</RouterLink>
            <RouterLink @click="closeMobileMenu" to="/kelola-guru" class="block py-2 px-4 text-gray-600 hover:bg-teal-50 rounded-lg" active-class="bg-teal-100 text-teal-600 font-semibold">Kelola Guru</RouterLink>
            <RouterLink @click="closeMobileMenu" to="/kelola-anak" class="block py-2 px-4 text-gray-600 hover:bg-teal-50 rounded-lg" active-class="bg-teal-100 text-teal-600 font-semibold">Kelola Anak</RouterLink>
            <RouterLink @click="closeMobileMenu" to="/absensi-anak" class="block py-2 px-4 text-gray-600 hover:bg-teal-50 rounded-lg" active-class="bg-teal-100 text-teal-600 font-semibold">Absensi Anak</RouterLink>
        </div>
        
        <!-- Info Pengguna dan Logout (Mobile) -->
        <div v-if="authStore.user" class="border-t mt-4 pt-4">
            <div class="flex items-center space-x-3 px-4 mb-4">
                <img :src="authStore.user.photoURL" alt="Foto Profil" class="w-10 h-10 rounded-full">
                <div>
                    <p class="text-sm font-medium text-gray-800">{{ authStore.user.displayName }}</p>
                    <p class="text-xs text-gray-500">{{ authStore.user.email }}</p>
                </div>
            </div>
            <button @click="handleLogout" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Logout
            </button>
        </div>
      </div>
    </nav>
  </header>
</template>
