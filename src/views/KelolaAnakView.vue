<script setup>
// File: src/views/KelolaAnakView.vue
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAnakStore } from '@/stores/anakStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import Navbar from '@/components/Navbar.vue';
import QrcodeVue from 'qrcode.vue';

const anakStore = useAnakStore();
const masterDataStore = useMasterDataStore();

const jenisKelaminOptions = ['Laki-laki', 'Perempuan'];
const jemaatOptions = ['GKI Beringin - Induk', 'GKI Beringin - Puri Anjasmoro', 'GKI Beringin - BSB', 'Lainnya'];

const formAnak = ref({
  namaLengkap: '', namaPanggilan: '', tanggalLahir: '', jenisKelamin: '',
  namaOrangTua: '', emailOrangTua: '', alamat: '', noWA: '', hobi: '', 
  identitasJemaat: '', sudahSekolah: false, namaSekolah: '', 
  alamatSekolah: '', kelasSekolah: '', kelasSM: '', fotoUrl: ''
});

const fotoFile = ref(null);
const fotoPreview = ref(null);
const isEditing = ref(false);
const editingAnakId = ref(null);
const searchQuery = ref('');
const isQrModalOpen = ref(false);
const selectedAnakForQR = ref(null);

const openQrModal = (anak) => {
  selectedAnakForQR.value = anak;
  isQrModalOpen.value = true;
};
const closeQrModal = () => {
  isQrModalOpen.value = false;
  selectedAnakForQR.value = null;
};
const printQrCard = () => { window.print(); };

onMounted(() => {
  anakStore.fetchAnak();
  masterDataStore.fetchAllOptions();
});
onUnmounted(() => {
  if (anakStore.unsubscribe) {
    anakStore.unsubscribe();
  }
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    fotoFile.value = file;
    fotoPreview.value = URL.createObjectURL(file);
  }
};
const handleSubmit = async () => {
  if (formAnak.value.namaLengkap.trim() === '' || formAnak.value.kelasSM === '') {
    alert('Nama Lengkap dan Kelas Sekolah Minggu harus diisi.');
    return;
  }
  if (!formAnak.value.sudahSekolah) {
    formAnak.value.namaSekolah = '';
    formAnak.value.alamatSekolah = '';
    formAnak.value.kelasSekolah = '';
  }
  if (isEditing.value) {
    await anakStore.updateAnak(editingAnakId.value, formAnak.value, fotoFile.value);
  } else {
    await anakStore.addAnak(formAnak.value, fotoFile.value);
  }
  resetForm();
};
const handleEdit = (anak) => {
  isEditing.value = true;
  editingAnakId.value = anak.id;
  formAnak.value = { ...anak };
  fotoPreview.value = anak.fotoUrl || null;
  window.scrollTo(0, 0);
};
const cancelEdit = () => { resetForm(); };
const resetForm = () => {
  isEditing.value = false;
  editingAnakId.value = null;
  formAnak.value = {
    namaLengkap: '', namaPanggilan: '', tanggalLahir: '', jenisKelamin: '',
    namaOrangTua: '', emailOrangTua: '', alamat: '', noWA: '', hobi: '',
    identitasJemaat: '', sudahSekolah: false, namaSekolah: '',
    alamatSekolah: '', kelasSekolah: '', kelasSM: '', fotoUrl: ''
  };
  fotoFile.value = null;
  fotoPreview.value = null;
  const fileInput = document.getElementById('fotoAnakInput');
  if(fileInput) fileInput.value = '';
};
const handleDeleteAnak = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus data anak ini?')) {
    anakStore.deleteAnak(id);
    if (isEditing.value && editingAnakId.value === id) {
      resetForm();
    }
  }
};
const filteredChildren = computed(() => {
  if (!searchQuery.value) return anakStore.children;
  const q = searchQuery.value.toLowerCase();
  return anakStore.children.filter(anak => {
    const namaLengkapMatch = anak.namaLengkap && anak.namaLengkap.toLowerCase().includes(q);
    const namaPanggilanMatch = anak.namaPanggilan && anak.namaPanggilan.toLowerCase().includes(q);
    return namaLengkapMatch || namaPanggilanMatch;
  });
});
</script>

<template>
  <div>
    <Navbar />
    <main class="container mx-auto p-4 mt-8">
      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Kelola Data Anak</h1>

        <!-- ==================== FORM UNTUK TAMBAH / EDIT ANAK ==================== -->
        <div class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ isEditing ? 'Edit Data Anak' : 'Tambah Anak Baru' }}
          </h2>
          <form @submit.prevent="handleSubmit">
            <fieldset class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 border p-4 rounded-md mb-6">
              <legend class="text-lg font-medium text-gray-700 px-2">Identitas Diri & Keluarga</legend>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                <input v-model="formAnak.namaLengkap" type="text" required class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Nama Panggilan</label>
                <input v-model="formAnak.namaPanggilan" type="text" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Tanggal Lahir</label>
                <input v-model="formAnak.tanggalLahir" type="date" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                 <select v-model="formAnak.jenisKelamin" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  <option disabled value="">Pilih...</option>
                  <option v-for="gender in jenisKelaminOptions" :key="gender" :value="gender">{{ gender }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Nama Orang Tua</label>
                <input v-model="formAnak.namaOrangTua" type="text" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Email Orang Tua (Login)</label>
                <input v-model="formAnak.emailOrangTua" type="email" placeholder="Gunakan email Google" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Alamat</label>
                <input v-model="formAnak.alamat" type="text" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">No. WA</label>
                <input v-model="formAnak.noWA" type="tel" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Hobi</label>
                <input v-model="formAnak.hobi" type="text" class="w-full p-3 border border-gray-300 rounded-lg"/>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">Upload Foto</label>
                <input id="fotoAnakInput" @change="handleFileChange" type="file" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                <img v-if="fotoPreview" :src="fotoPreview" alt="Preview Foto" class="mt-4 w-32 h-32 rounded-lg object-cover shadow-md"/>
              </div>
            </fieldset>

            <fieldset class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-md mb-6">
               <legend class="text-lg font-medium text-gray-700 px-2">Identitas Gereja & SM</legend>
               <div>
                 <label class="block text-sm font-medium text-gray-600 mb-1">Asal Jemaat</label>
                 <select v-model="formAnak.identitasJemaat" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  <option disabled value="">Pilih...</option>
                  <option v-for="jemaat in jemaatOptions" :key="jemaat" :value="jemaat">{{ jemaat }}</option>
                </select>
               </div>
               <div>
                 <label class="block text-sm font-medium text-gray-600 mb-1">Kelas Sekolah Minggu</label>
                 <select v-model="formAnak.kelasSM" required class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  <option v-if="masterDataStore.loading" disabled value="">Memuat...</option>
                  <option v-else disabled value="">Pilih kelas...</option>
                  <option v-for="kelas in masterDataStore.kelasSMOptions" :key="kelas" :value="kelas">{{ kelas }}</option>
                </select>
               </div>
            </fieldset>

            <fieldset class="border p-4 rounded-md">
               <legend class="text-lg font-medium text-gray-700 px-2">Identitas Sekolah Formal</legend>
               <div class="mb-4">
                 <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="formAnak.sudahSekolah" class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                    <span>Sudah bersekolah?</span>
                  </label>
               </div>
               <div v-if="formAnak.sudahSekolah" class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                 <div>
                   <label class="block text-sm font-medium text-gray-600 mb-1">Nama Sekolah</label>
                   <input v-model="formAnak.namaSekolah" type="text" class="w-full p-3 border border-gray-300 rounded-lg"/>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-600 mb-1">Alamat Sekolah</label>
                   <input v-model="formAnak.alamatSekolah" type="text" class="w-full p-3 border border-gray-300 rounded-lg"/>
                 </div>
                 <div>
                   <label class="block text-sm font-medium text-gray-600 mb-1">Kelas</label>
                   <select v-model="formAnak.kelasSekolah" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                     <option v-if="masterDataStore.loading" disabled value="">Memuat...</option>
                     <option v-else disabled value="">Pilih kelas...</option>
                     <option v-for="kelas in masterDataStore.kelasFormalOptions" :key="kelas" :value="kelas">{{ kelas }}</option>
                   </select>
                 </div>
               </div>
            </fieldset>

            <div class="flex items-center gap-4 mt-6">
              <button type="submit" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                {{ isEditing ? 'Update Anak' : 'Simpan Anak Baru' }}
              </button>
              <button v-if="isEditing" @click.prevent="cancelEdit" type="button" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                Batal
              </button>
            </div>
          </form>
        </div>
        
        <!-- ==================== DAFTAR ANAK TERDAFTAR ==================== -->
        <h2 class="text-2xl font-bold text-gray-800 mb-4 pt-4 border-t">Daftar Anak Terdaftar</h2>
        <div class="mb-4">
          <label for="search" class="block text-sm font-medium text-gray-600 mb-1">Cari Anak</label>
          <input v-model="searchQuery" id="search" type="text" placeholder="Ketik nama..." class="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg"/>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">No. Induk</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Nama & Kelas SM</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="anakStore.loading"><td colspan="5" class="text-center p-4">Memuat...</td></tr>
              <tr v-else-if="filteredChildren.length === 0">
                <td colspan="5" class="text-center p-4 text-gray-500">Tidak ada data anak yang terdaftar.</td>
              </tr>
              <tr v-else v-for="anak in filteredChildren" :key="anak.id" class="hover:bg-gray-50">
                <td class="py-2 px-4">
                  <img :src="anak.fotoUrl || 'https://placehold.co/60x60/E2E8F0/A0AEC0?text=Foto'" alt="Foto Anak" class="w-12 h-12 rounded-full object-cover"/>
                </td>
                <td class="py-2 px-4 whitespace-nowrap">
                  <div class="font-mono text-sm text-gray-700">{{ anak.nomorInduk || 'N/A' }}</div>
                </td>
                <td class="py-2 px-4 whitespace-nowrap">
                  <div class="font-medium text-gray-800">{{ anak.namaLengkap }}</div>
                  <div class="text-sm text-gray-500">Kelas SM: {{ anak.kelasSM }}</div>
                </td>
                <td class="py-2 px-4 text-sm text-gray-600">{{ anak.namaOrangTua || '-' }}</td>
                <td class="py-2 px-4 whitespace-nowrap">
                  <button @click="handleEdit(anak)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm">Edit</button>
                  <button @click="openQrModal(anak)" class="bg-gray-700 hover:bg-gray-800 text-white font-bold py-1 px-3 rounded-md text-sm ml-2">Kartu QR</button>
                  <button @click="handleDeleteAnak(anak.id)" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm ml-2">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- ==================== MODAL KARTU QR ==================== -->
    <div v-if="isQrModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 printable-area">
      <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm mx-auto text-center printable-card">
        <h3 class="text-2xl font-bold mb-4">Kartu Member Sekolah Minggu</h3>
        <img :src="selectedAnakForQR.fotoUrl || 'https://placehold.co/150x150/E2E8F0/A0AEC0?text=Foto'" alt="Foto Profil" class="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-teal-400">
        <p class="text-xl font-semibold">{{ selectedAnakForQR.namaLengkap }}</p>
        <p class="text-gray-600 mb-6">Kelas: {{ selectedAnakForQR.kelasSM }}</p>
        <QrcodeVue :value="selectedAnakForQR.id" :size="200" level="H" class="mx-auto" />
        <div class="mt-8 flex justify-center gap-4 no-print">
          <button @click="printQrCard" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg">Cetak</button>
          <button @click="closeQrModal" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body * { visibility: hidden; }
  .printable-area, .printable-area * { visibility: visible; }
  .printable-area {
    position: absolute; left: 0; top: 0;
    width: 100%; height: 100%; display: flex;
    justify-content: center; align-items: center;
  }
  .printable-card { border: 2px solid black; box-shadow: none; margin: 0; padding: 2rem; }
  .no-print { display: none !important; }
}
</style>