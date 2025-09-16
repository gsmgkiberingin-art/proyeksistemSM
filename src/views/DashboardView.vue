<script setup>
// File: src/views/DashboardView.vue
// Tujuan: Halaman utama yang fungsional setelah pengguna login.

import { onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { useAuthStore } from '../stores/authStore';
import { useAbsensiStore } from '../stores/absensiStore';

const authStore = useAuthStore();
const absensiStore = useAbsensiStore();

// Fungsi untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
const getTodayDate = () => {
  return new Date().toISOString().slice(0, 10);
};

// Ambil data ringkasan saat komponen dimuat
onMounted(() => {
  absensiStore.fetchDashboardSummary(getTodayDate());
});
</script>

<template>
  <div>
    <Navbar />
    <main class="container mx-auto p-4 mt-8 space-y-8">
      <!-- Header Selamat Datang -->
      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <div class="flex items-center justify-center sm:justify-start space-x-4">
            <img 
            v-if="authStore.user?.photoURL"
            :src="authStore.user.photoURL" 
            alt="Foto Profil"
            class="w-20 h-20 rounded-full border-4 border-teal-400 shadow-md"
            >
            <div class="text-center sm:text-left">
                <h1 class="text-3xl sm:text-4xl font-bold text-gray-800">
                Selamat Datang!
                </h1>
                <p class="text-gray-600 mt-1 text-lg">
                {{ authStore.user?.displayName || 'Pengguna' }}
                </p>
            </div>
        </div>
      </div>

      <!-- Navigasi Cepat -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RouterLink to="/absensi-anak" class="group block p-6 bg-teal-500 hover:bg-teal-600 rounded-2xl shadow-lg text-white transition-transform transform hover:-translate-y-1">
          <h2 class="text-2xl font-bold">Absensi Anak</h2>
          <p class="mt-2 opacity-90 group-hover:opacity-100">Catat kehadiran anak sekolah minggu hari ini.</p>
        </RouterLink>
        <RouterLink to="/kelola-anak" class="group block p-6 bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg text-white transition-transform transform hover:-translate-y-1">
          <h2 class="text-2xl font-bold">Kelola Anak</h2>
          <p class="mt-2 opacity-90 group-hover:opacity-100">Tambah, edit, atau hapus data anak.</p>
        </RouterLink>
        <RouterLink to="/kelola-guru" class="group block p-6 bg-indigo-500 hover:bg-indigo-600 rounded-2xl shadow-lg text-white transition-transform transform hover:-translate-y-1">
          <h2 class="text-2xl font-bold">Kelola Guru</h2>
          <p class="mt-2 opacity-90 group-hover:opacity-100">Kelola data guru dan pembimbing.</p>
        </RouterLink>
      </div>

      <!-- Ringkasan Absensi -->
      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Ringkasan Absensi Hari Ini</h2>
        <p class="text-gray-500 mb-6">Data absensi untuk tanggal: {{ getTodayDate() }}</p>
        
        <div v-if="absensiStore.loading" class="text-center text-gray-500 py-8">
          Memuat data ringkasan...
        </div>
        <div v-else-if="!absensiStore.dashboardSummary || absensiStore.dashboardSummary.totalHadir === 0" class="text-center bg-gray-50 p-8 rounded-lg">
          <p class="text-gray-600">Belum ada data absensi yang tercatat untuk hari ini.</p>
        </div>
        <div v-else class="space-y-6">
          <div class="text-center bg-teal-100 text-teal-800 p-6 rounded-2xl">
            <p class="text-xl font-medium">Total Kehadiran Hari Ini</p>
            <p class="text-6xl font-bold">{{ absensiStore.dashboardSummary.totalHadir }}</p>
            <p>Anak</p>
          </div>

          <div class="space-y-4">
            <div v-for="data in absensiStore.dashboardSummary.rincian" :key="data.lokasi" class="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h3 class="font-bold text-xl text-gray-700">Lokasi: {{ data.lokasi }} (Total: {{ data.totalHadir }} anak)</h3>
              <ul class="mt-2 list-disc list-inside text-gray-600">
                <li v-for="kelas in data.kelas" :key="kelas.nama + kelas.jam">
                  Kelas {{ kelas.nama }} ({{ kelas.jam }}): <strong>{{ kelas.hadir }} anak</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
