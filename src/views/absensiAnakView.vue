<script setup>
import { ref } from 'vue';
import { useAbsensiStore } from '@/stores/absensiStore';
import Navbar from '@/components/Navbar.vue';
import { QrcodeStream } from 'vue-qrcode-reader';

const absensiStore = useAbsensiStore();

// Opsi untuk filter
const lokasiOptions = ['Induk', 'Puri', 'BSB'];
const jamOptions = ['08:00', '10:00', '17:00'];
const kelasOptions = ['Balita', 'Pre-School', 'KB', 'TK', '1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'];

// State untuk filter
const filter = ref({
  tanggal: new Date().toISOString().slice(0, 10),
  lokasi: '',
  jam: '',
  kelas: ''
});

const dataLoaded = ref(false);

// State untuk Scanner
const isScannerOpen = ref(false);
const scanResult = ref({ message: '', type: '' });
const scanError = ref('');

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

// Fungsi untuk menangani hasil deteksi QR
const onDetect = (detectedCodes) => {
  if (detectedCodes.length > 0) {
    const anakId = detectedCodes[0].rawValue;
    const anak = absensiStore.anakPerKelas.find(a => a.id === anakId);

    if (anak) {
      if (!absensiStore.daftarHadir.has(anakId)) {
        absensiStore.toggleKehadiran(anakId);
        showScanFeedback(`✅ ${anak.namaPanggilan || anak.namaLengkap} berhasil diabsen!`, 'success');
      } else {
        showScanFeedback(`🤔 ${anak.namaPanggilan || anak.namaLengkap} sudah terabsen.`, 'info');
      }
    } else {
      showScanFeedback(`❌ Anak dengan QR ini tidak ditemukan di kelas ${filter.value.kelas}.`, 'error');
    }
    
    // Beri jeda sedikit agar pengguna melihat hasilnya sebelum menutup
    setTimeout(() => {
      isScannerOpen.value = false;
    }, 1200);
  }
};

// Fungsi untuk menampilkan pesan feedback hasil scan
const showScanFeedback = (message, type) => {
  scanResult.value = { message, type };
  setTimeout(() => {
    scanResult.value = { message: '', type: '' };
  }, 3000); // Pesan hilang setelah 3 detik
};

// Fungsi untuk menangani error saat inisialisasi kamera
const onScannerInit = async (promise) => {
  scanError.value = ''; // Reset error setiap kali scanner dibuka
  try {
    await promise;
  } catch (error) {
    console.error("Camera error:", error);
    if (error.name === 'NotAllowedError') {
      scanError.value = "Izin kamera dibutuhkan. Harap izinkan akses kamera di pengaturan browser Anda.";
    } else if (error.name === 'NotFoundError') {
      scanError.value = "Tidak ada kamera yang ditemukan di perangkat ini.";
    } else if (error.name === 'NotReadableError') {
      scanError.value = "Kamera sedang digunakan oleh aplikasi lain.";
    } else {
      scanError.value = `Error kamera tidak dikenal: ${error.name}`;
    }
  }
};
</script>

<template>
  <div>
    <Navbar />
    <main class="container mx-auto p-4 mt-8">
      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Absensi Anak Sekolah Minggu</h1>

        <div class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">1. Pilih Kriteria Ibadah</h2>
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
          <div class="flex flex-col md:flex-row justify-between md:items-center gap-4 pt-4 border-t">
            <h3 class="text-2xl font-bold text-gray-800">
                2. Daftar Hadir Kelas: {{ filter.kelas }}
                <span class="text-lg font-normal text-gray-600 block sm:inline">
                    (Total Hadir: {{ absensiStore.daftarHadir.size }} dari {{ absensiStore.anakPerKelas.length }} anak)
                </span>
            </h3>
            <button 
              @click="isScannerOpen = true" 
              class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Scan QR Code
            </button>
          </div>

          <!-- Pesan Feedback Hasil Scan -->
          <div v-if="scanResult.message" :class="{
            'bg-green-100 border-green-500 text-green-700': scanResult.type === 'success',
            'bg-yellow-100 border-yellow-500 text-yellow-700': scanResult.type === 'info',
            'bg-red-100 border-red-500 text-red-700': scanResult.type === 'error',
            }" class="border-l-4 p-4 my-4 rounded-r-lg" role="alert">
            <p class="font-bold">{{ scanResult.message }}</p>
          </div>

          <div v-if="absensiStore.loading" class="text-center p-8">
              <p>Memuat data...</p>
          </div>
          <div v-else>
               <div v-if="absensiStore.anakPerKelas.length > 0" class="mt-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
               <div v-else class="text-center p-8 mt-4">
                   <p class="text-gray-500">Tidak ada anak yang terdaftar di kelas "{{ filter.kelas }}".</p>
               </div>
          </div>
        </div>
         <div v-else class="text-center p-8 border-t">
          <p class="text-gray-500">Silakan pilih kriteria di atas dan klik "Tampilkan Daftar" untuk memulai absensi.</p>
        </div>
      </div>
    </main>

    <!-- Overlay untuk Scanner -->
    <div v-if="isScannerOpen" class="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center p-4">
      <div class="bg-white rounded-lg overflow-hidden w-full max-w-md">
        <div class="p-4 border-b">
          <h3 class="text-lg font-bold text-center">Arahkan Kamera ke QR Code Anak</h3>
        </div>
        <div v-if="scanError" class="p-4 text-center text-red-600 bg-red-50">
          <p class="font-semibold">Gagal Membuka Kamera</p>
          <p>{{ scanError }}</p>
        </div>
        <qrcode-stream @detect="onDetect" @init="onScannerInit" v-else></qrcode-stream>
      </div>
      <button @click="isScannerOpen = false" class="mt-4 bg-white text-black font-bold py-2 px-6 rounded-full">Tutup</button>
    </div>
  </div>
</template>