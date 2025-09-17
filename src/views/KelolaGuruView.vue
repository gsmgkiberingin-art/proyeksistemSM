<script setup>
// File: src/views/KelolaGuruView.vue
import { ref, onMounted, onUnmounted } from 'vue';
import { useGuruStore } from '@/stores/guruStore';
import Navbar from '@/components/Navbar.vue'; // <-- Impor dengan 'N' besar

const guruStore = useGuruStore();

// Opsi untuk dropdown dan checkbox
const anggotaGerejaOptions = ['GKI Beringin - Induk', 'GKI Beringin - Puri Anjasmoro', 'GKI Beringin - BSB', 'Pilihan Lain'];
const peranOptions = ['Pengajar', 'Musik', 'Wali Kelas', 'Koordinator', 'Admin', 'Pengurus'];
const kelasOptions = ['Balita', 'Pre-School', 'KB', 'TK', '1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'];
const jenisKelaminOptions = ['Laki-laki', 'Perempuan'];

// State untuk form
const formTeacher = ref({
  nomorInduk: '',
  nama: '',
  email: '', 
  alamat: '',
  tanggalLahir: '',
  jenisKelamin: '',
  noHp: '',
  anggotaGereja: '',
  peran: [], 
  mengajarDiKelas: [],
  fotoUrl: ''
});
const fotoFile = ref(null);
const fotoPreview = ref(null);
const otherGereja = ref('');
const isOtherKelasChecked = ref(false);
const otherKelas = ref('');
const isEditing = ref(false);
const editingTeacherId = ref(null);

onMounted(() => { guruStore.fetchTeachers(); });
onUnmounted(() => { if (guruStore.unsubscribe) { guruStore.unsubscribe(); } });

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    fotoFile.value = file;
    fotoPreview.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  if (formTeacher.value.nama.trim() === '' || formTeacher.value.peran.length === 0 || formTeacher.value.email.trim() === '') {
    alert('Nama, Email, dan minimal satu Peran harus diisi.');
    return;
  }
  
  const dataToSubmit = JSON.parse(JSON.stringify(formTeacher.value));
  if (dataToSubmit.anggotaGereja === 'Pilihan Lain' && otherGereja.value.trim()) {
    dataToSubmit.anggotaGereja = otherGereja.value.trim();
  }
  if (isOtherKelasChecked.value && otherKelas.value.trim()) {
     dataToSubmit.mengajarDiKelas.push(otherKelas.value.trim());
  }

  const { nomorInduk, ...teacherData } = dataToSubmit;

  if (isEditing.value) {
    await guruStore.updateTeacher(editingTeacherId.value, teacherData, fotoFile.value);
  } else {
    await guruStore.addTeacher(teacherData, fotoFile.value);
  }
  resetForm();
};

const handleEdit = (teacher) => {
  isEditing.value = true;
  editingTeacherId.value = teacher.id;

  if (anggotaGerejaOptions.includes(teacher.anggotaGereja)) {
    formTeacher.value.anggotaGereja = teacher.anggotaGereja;
    otherGereja.value = '';
  } else {
    formTeacher.value.anggotaGereja = 'Pilihan Lain';
    otherGereja.value = teacher.anggotaGereja || '';
  }
  const standardClasses = [];
  let customClass = '';
  (teacher.mengajarDiKelas || []).forEach(kelas => {
    if (kelasOptions.includes(kelas)) standardClasses.push(kelas);
    else customClass = kelas;
  });
  formTeacher.value.mengajarDiKelas = standardClasses;
  otherKelas.value = customClass;
  isOtherKelasChecked.value = !!customClass;

  formTeacher.value = { ...formTeacher.value, ...teacher };
  
  fotoPreview.value = teacher.fotoUrl || null;
  window.scrollTo(0, 0);
};

const cancelEdit = () => { resetForm(); };

const resetForm = () => {
  isEditing.value = false;
  editingTeacherId.value = null;
  formTeacher.value = { 
    nomorInduk: '', nama: '', email: '', alamat: '', tanggalLahir: '', 
    jenisKelamin: '', noHp: '', anggotaGereja: '', peran: [], 
    mengajarDiKelas: [], fotoUrl: '' 
  };
  fotoFile.value = null;
  fotoPreview.value = null;
  otherGereja.value = '';
  isOtherKelasChecked.value = false;
  otherKelas.value = '';
  const fileInput = document.getElementById('fotoInput');
  if(fileInput) fileInput.value = '';
};

const handleDeleteTeacher = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus guru ini?')) {
    guruStore.deleteTeacher(id);
    if (isEditing.value && editingTeacherId.value === id) {
      resetForm();
    }
  }
};
</script>

<template>
  <div>
    <Navbar />
    <main class="container mx-auto p-4 mt-8">
      <div class="bg-white p-8 rounded-2xl shadow-lg">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Kelola Data Guru</h1>

        <div class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ isEditing ? `Edit Data Guru (NIG: ${formTeacher.nomorInduk})` : 'Tambah Guru Baru' }}
          </h2>
          <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Kolom Kiri -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
              <input v-model="formTeacher.nama" type="text" required class="w-full p-3 border border-gray-300 rounded-lg"/>
              
              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Email (untuk Login)</label>
              <input v-model="formTeacher.email" type="email" required placeholder="Gunakan email Google" class="w-full p-3 border border-gray-300 rounded-lg"/>
              
              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Alamat</label>
              <textarea v-model="formTeacher.alamat" rows="2" class="w-full p-3 border border-gray-300 rounded-lg"></textarea>
              
              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Tanggal Lahir</label>
              <input v-model="formTeacher.tanggalLahir" type="date" class="w-full p-3 border border-gray-300 rounded-lg"/>
              
              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Jenis Kelamin</label>
              <div class="flex items-center space-x-6 mt-2">
                <label v-for="gender in jenisKelaminOptions" :key="gender" class="flex items-center">
                  <input type="radio" :value="gender" v-model="formTeacher.jenisKelamin" class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300">
                  <span class="ml-2 text-sm text-gray-700">{{ gender }}</span>
                </label>
              </div>

              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">No. WA</label>
              <input v-model="formTeacher.noHp" type="tel" placeholder="cth: 08123456789" class="w-full p-3 border border-gray-300 rounded-lg"/>
            </div>

            <!-- Kolom Kanan -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Anggota Jemaat</label>
              <select v-model="formTeacher.anggotaGereja" class="w-full p-3 border border-gray-300 rounded-lg bg-white">
                <option disabled value="">Pilih jemaat...</option>
                <option v-for="gereja in anggotaGerejaOptions" :key="gereja" :value="gereja">{{ gereja }}</option>
              </select>
              <input v-if="formTeacher.anggotaGereja === 'Pilihan Lain'" v-model="otherGereja" type="text" placeholder="Ketik nama jemaat lain" class="w-full p-3 mt-2 border border-gray-300 rounded-lg"/>

              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Peran</label>
              <div class="p-3 border border-gray-300 rounded-lg bg-white grid grid-cols-2 gap-2">
                <div v-for="role in peranOptions" :key="role">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" :value="role" v-model="formTeacher.peran" class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                    <span>{{ role }}</span>
                  </label>
                </div>
              </div>

              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Mengajar di Kelas</label>
              <div class="p-3 border border-gray-300 rounded-lg bg-white grid grid-cols-2 gap-2">
                <div v-for="kelas in kelasOptions" :key="kelas">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" :value="kelas" v-model="formTeacher.mengajarDiKelas" class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                    <span>{{ kelas }}</span>
                  </label>
                </div>
                <div class="col-span-2">
                   <label class="flex items-center space-x-2">
                    <input type="checkbox" v-model="isOtherKelasChecked" class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                    <span>Pilihan Lain</span>
                  </label>
                  <input v-if="isOtherKelasChecked" v-model="otherKelas" type="text" placeholder="Ketik nama kelas lain" class="w-full p-3 mt-2 border border-gray-300 rounded-lg"/>
                </div>
              </div>

              <label class="block text-sm font-medium text-gray-600 mb-1 mt-4">Upload Foto</label>
              <input id="fotoInput" @change="handleFileChange" type="file" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
              <img v-if="fotoPreview" :src="fotoPreview" alt="Preview Foto" class="mt-4 w-32 h-32 rounded-lg object-cover shadow-md"/>
            </div>

            <div class="md:col-span-2 flex items-center gap-4 mt-4">
              <button type="submit" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                {{ isEditing ? 'Update Guru' : 'Simpan Guru Baru' }}
              </button>
              <button v-if="isEditing" @click.prevent="cancelEdit" type="button" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                Batal
              </button>
            </div>
          </form>
        </div>

        <!-- Tabel Daftar Guru -->
        <h2 class="text-2xl font-bold text-gray-800 mb-4 pt-4 border-t">Daftar Guru Terdaftar</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead class="bg-gray-50">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Nomor Induk</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Nama & Jemaat</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Peran</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">No. WA</th>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="guruStore.loading"><td colspan="6" class="text-center p-4">Memuat data guru...</td></tr>
              <tr v-else v-for="guru in guruStore.teachers" :key="guru.id" class="hover:bg-gray-50">
                <td class="py-2 px-4">
                  <img :src="guru.fotoUrl || 'https://placehold.co/60x60/E2E8F0/A0AEC0?text=Foto'" alt="Foto Guru" class="w-12 h-12 rounded-full object-cover"/>
                </td>
                <td class="py-2 px-4 whitespace-nowrap">
                  <div class="font-mono text-sm text-gray-700">{{ guru.nomorInduk }}</div>
                </td>
                <td class="py-2 px-4 whitespace-nowrap">
                  <div class="font-medium text-gray-800">{{ guru.nama }}</div>
                  <div class="text-sm text-gray-500">{{ guru.anggotaGereja }}</div>
                </td>
                <td class="py-2 px-4 text-sm text-gray-600">
                  <div class="flex flex-col">
                    <span v-for="peran in guru.peran" :key="peran" class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full mb-1">{{ peran }}</span>
                  </div>
                </td>
                <td class="py-2 px-4 whitespace-nowrap">{{ guru.noHp || '-' }}</td>
                <td class="py-2 px-4 whitespace-nowrap">
                  <button @click="handleEdit(guru)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm">Edit</button>
                  <button @click="handleDeleteTeacher(guru.id)" class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm ml-2">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>