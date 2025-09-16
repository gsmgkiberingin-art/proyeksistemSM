// File: src/stores/masterDataStore.js
// Tujuan: Mengelola semua data master terpusat (seperti daftar kelas) dari Firestore.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const useMasterDataStore = defineStore('masterData', () => {
  // State: Tempat menyimpan daftar pilihan setelah diambil dari Firestore
  const kelasSMOptions = ref([]);
  const kelasFormalOptions = ref([]);
  const loading = ref(false);

  // Actions: Fungsi untuk mengambil data dari Firestore
  const fetchAllOptions = async () => {
    // Jika data sudah pernah diambil, jangan ambil ulang untuk efisiensi
    if (kelasSMOptions.value.length > 0 && kelasFormalOptions.value.length > 0) {
      return;
    }

    loading.value = true;
    try {
      // 1. Ambil data kelas Sekolah Minggu dari dokumen 'kelasSM'
      const kelasSMRef = doc(db, 'master_data', 'kelasSM');
      const kelasSMSnap = await getDoc(kelasSMRef);
      if (kelasSMSnap.exists()) {
        // Simpan daftar kelas ke dalam state
        kelasSMOptions.value = kelasSMSnap.data().options || [];
      } else {
        console.warn("Peringatan: Dokumen master 'kelasSM' tidak ditemukan di Firestore.");
      }

      // 2. Ambil data kelas Sekolah Formal dari dokumen 'kelasFormal'
      const kelasFormalRef = doc(db, 'master_data', 'kelasFormal');
      const kelasFormalSnap = await getDoc(kelasFormalRef);
      if (kelasFormalSnap.exists()) {
        // Simpan daftar kelas ke dalam state
        kelasFormalOptions.value = kelasFormalSnap.data().options || [];
      } else {
        console.warn("Peringatan: Dokumen master 'kelasFormal' tidak ditemukan di Firestore.");
      }

    } catch (error) {
      console.error("Gagal mengambil data master:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    kelasSMOptions,
    kelasFormalOptions,
    loading,
    fetchAllOptions,
  };
});
