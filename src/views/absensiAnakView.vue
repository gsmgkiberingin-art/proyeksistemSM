<script setup>
// File: src/views/AbsensiAnakView.vue
// Tujuan: Halaman untuk guru melakukan absensi anak.

import { ref } from 'vue';
// PERBAIKAN: Mengubah path yang salah menjadi alias path yang benar.
import { useAbsensiStore } from '@/stores/absensiStore';
import Navbar from '@/components/Navbar.vue';

const absensiStore = useAbsensiStore();

// Opsi untuk filter
const lokasiOptions = ['Induk', 'Puri', 'BSB'];
const jamOptions = ['08:00', '10:00', '17:00'];
const kelasOptions = ['Balita', 'Pre-School', 'KB', 'TK', '1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'];

// State untuk filter
const filter = ref({
  tanggal: new Date().toISOString().slice(0, 10), // Default hari ini
  lokasi: '',
  jam: '',
  kelas: ''
});

const dataLoaded = ref(false);

const handleLoadData = () => {
  const { tanggal, lokasi, jam, kelas } = filter.value;
  if (!tanggal || !lokasi || !jam || !kelas) {
    alert('Harap lengkapi semua filter (Tanggal, Lokasi, Jam, dan Kelas).');
    return;
  }
  absensiStore.fetchAnakDanAbsensi(tanggal, lokasi, jam, kelas);
  dataLoaded.value = true;
};

const handleSimpan = () => {
    const { tanggal, lokasi, jam, kelas } = filter.value;
    absensiStore.simpanAbsensi(tanggal, lokasi, jam, kelas);
}
</script>

<template>
  <div>
    <Navbar />
    <main class="container mx-auto p-4 mt-8">
      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Absensi Anak Sekolah Minggu</h1>

        <div class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">Pilih Kriteria Ibadah</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
              <input v-model="filter.tanggal" type="date" class="w-full p-3 border border-gray-300 rounded-lg"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Lokasi/Cabang</label>
              <select v-model="filter.lokasi" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <option disabled value="">Pilih lokasi...</option>
                <option v-for="loc in lokasiOptions" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Jam Ibadah</label>
              <select v-model="filter.jam" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <option disabled value="">Pilih jam...</option>
                <option v-for="j in jamOptions" :key="j" :value="j">{{ j }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Kelas</label>
              <select v-model="filter.kelas" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <option disabled value="">Pilih kelas...</option>
                <option v-for="k in kelasOptions" :key="k" :value="k">{{ k }}</option>
              </select>
            </div>
            <button @click="handleLoadData" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full">
              Tampilkan Daftar
            </button>
          </div>
        </div>

        <div v-if="dataLoaded">
            <div v-if="absensiStore.loading" class="text-center p-8">
                <p>Memuat data...</p>
            </div>
            <div v-else>
                 <div v-if="absensiStore.anakPerKelas.length > 0">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4 pt-4 border-t">
                        Daftar Anak Kelas: {{ filter.kelas }}
                        <span class="text-lg font-normal text-gray-600">
                            (Total Hadir: {{ absensiStore.daftarHadir.size }} dari {{ absensiStore.anakPerKelas.length }} anak)
                        </span>
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div 
                            v-for="anak in absensiStore.anakPerKelas" :key="anak.id"
                            class="border rounded-lg p-3 flex items-center space-x-3 cursor-pointer transition-all"
                            :class="absensiStore.daftarHadir.has(anak.id) ? 'bg-teal-50 border-teal-400 shadow' : 'bg-white hover:bg-gray-50'"
                            @click="absensiStore.toggleKehadiran(anak.id)"
                        >
                            <input 
                                type="checkbox"
                                :checked="absensiStore.daftarHadir.has(anak.id)"
                                class="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 pointer-events-none"
                            >
                            <img :src="anak.fotoUrl || 'https://placehold.co/60x60/E2E8F0/A0AEC0?text=Foto'" alt="Foto Anak" class="w-12 h-12 rounded-full object-cover"/>
                            <div>
                                <p class="font-medium text-gray-800">{{ anak.namaLengkap }}</p>
                                <p class="text-sm text-gray-500">{{ anak.namaPanggilan }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 text-center">
                        <button @click="handleSimpan" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                            Simpan Absensi
                        </button>
                    </div>
                 </div>
                 <div v-else class="text-center p-8 border-t">
                     <p class="text-gray-500">Tidak ada anak yang terdaftar di kelas "{{ filter.kelas }}".</p>
                 </div>
            </div>
        </div>
         <div v-else class="text-center p-8 border-t">
          <p class="text-gray-500">Silakan pilih kriteria di atas dan klik "Tampilkan Daftar" untuk memulai absensi.</p>
        </div>

      </div>
    </main>
  </div>
</template>
