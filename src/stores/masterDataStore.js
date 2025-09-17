// File: src/stores/masterDataStore.js
// Tujuan: Mengelola data master. Dengan sintaksis yang sudah diperbaiki.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export const useMasterDataStore = defineStore('masterData', () => {
  const kelasSMOptions = ref([]);
  const kelasFormalOptions = ref([]);
  const loading = ref(false);

  const fetchAllOptions = async () => {
    if (kelasSMOptions.value.length > 0 && kelasFormalOptions.value.length > 0) {
      return;
    }

    loading.value = true;
    console.log("Fetching master data...");
    try {
      // 1. Ambil data kelas Sekolah Minggu
      const kelasSMRef = doc(db, 'master_data', 'kelasSM');
      const kelasSMSnap = await getDoc(kelasSMRef);
      if (kelasSMSnap.exists()) {
        const options = kelasSMSnap.data().kelasSM;
        console.log("Dokumen kelasSM ditemukan, isi field 'kelasSM':", options);
        kelasSMOptions.value = options || [];
      } else {
        console.warn("Peringatan: Dokumen master 'kelasSM' tidak ditemukan di Firestore.");
      }

      // 2. Ambil data kelas Sekolah Formal
      const kelasFormalRef = doc(db, 'master_data', 'kelasFormal');
      const kelasFormalSnap = await getDoc(kelasFormalRef);
      if (kelasFormalSnap.exists()) {
        // Asumsi nama fieldnya 'kelasFormal' juga
        const options = kelasFormalSnap.data().kelasFormal;
        console.log("Dokumen kelasFormal ditemukan, isi field 'kelasFormal':", options);
        kelasFormalOptions.value = options || [];
      } else {
        console.warn("Peringatan: Dokumen master 'kelasFormal' tidak ditemukan di Firestore.");
      }

    } catch (error) { // <-- PERBAIKAN: Kurung kurawal ditambahkan
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