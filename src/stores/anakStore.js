// File: src/stores/anakStore.js
// Tujuan: Mengelola semua logika bisnis terkait data anak (CRUD ke Firestore).

import { defineStore } from 'pinia';
import { ref } from 'vue';
// Impor fungsi yang dibutuhkan untuk transaksi, query, dll.
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, runTransaction, where, getDocs } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

export const useAnakStore = defineStore('anakStore', () => {
  // State
  const children = ref([]);
  const loading = ref(false);
  let unsubscribe = null;

  // Helper function untuk upload foto
  const uploadAnakPhoto = async (file) => {
    if (!file) return null;
    const filePath = `anak_photos/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // Actions
  const fetchAnak = () => {
    loading.value = true;
    const q = query(collection(db, "children"), orderBy("namaLengkap"));

    unsubscribe = onSnapshot(q, (querySnapshot) => {
      children.value = [];
      querySnapshot.forEach((doc) => {
        children.value.push({ id: doc.id, ...doc.data() });
      });
      loading.value = false;
    }, (error) => {
      console.error("Error fetching children data: ", error);
      loading.value = false;
    });
  };

  const addAnak = async (anakData, file) => {
    try {
      // --- PENGECEKAN DUPLIKAT (CASE-INSENSITIVE) ---
      const normalizedName = anakData.namaLengkap.toLowerCase().trim();
      const q = query(collection(db, "children"), where("namaLengkap_lowercase", "==", normalizedName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert(`Error: Anak dengan nama "${anakData.namaLengkap}" sudah terdaftar.`);
        return;
      }
      // --- AKHIR PENGECEKAN ---

      // --- TRANSAKSI UNTUK NOMOR INDUK OTOMATIS ---
      const counterRef = doc(db, "counters", "childCounter");

      const newId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          // Jika dokumen counter belum ada, buat baru dan mulai dari 2000
          transaction.set(counterRef, { lastId: 2000 });
          return 2001;
        }
        
        const newLastId = counterDoc.data().lastId + 1;
        transaction.update(counterRef, { lastId: newLastId });
        return newLastId;
      });
      // --- AKHIR TRANSAKSI ---
      
      const fotoUrl = await uploadAnakPhoto(file);
      if (fotoUrl) {
        anakData.fotoUrl = fotoUrl;
      }
      
      // Tambahkan field baru ke data yang akan disimpan
      const dataToSave = {
        ...anakData,
        nomorInduk: `A-${newId}`,
        namaLengkap_lowercase: normalizedName,
        createdAt: new Date() // Tambahkan timestamp
      };

      await addDoc(collection(db, "children"), dataToSave);
      console.log("Data anak berhasil ditambahkan dengan NIA: " + dataToSave.nomorInduk);

    } catch (e) {
      console.error("Error adding document: ", e);
      // Tampilkan error yang lebih spesifik jika counter tidak ada
      if (e.message.includes("counter")) {
        alert("Error: Dokumen 'childCounter' tidak ditemukan di Firestore. Harap setup terlebih dahulu.");
      }
    }
  };
  
  const updateAnak = async (id, anakData, file) => {
    try {
      const fotoUrl = await uploadAnakPhoto(file);
      if (fotoUrl) {
        anakData.fotoUrl = fotoUrl;
      }

      // Pastikan nama_lowercase juga diupdate saat nama lengkap berubah
      if(anakData.namaLengkap) {
          anakData.namaLengkap_lowercase = anakData.namaLengkap.toLowerCase().trim();
      }

      const anakDocRef = doc(db, "children", id);
      await updateDoc(anakDocRef, anakData);
      console.log("Data anak berhasil diperbarui!");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteAnak = async (id) => {
    try {
      await deleteDoc(doc(db, "children", id));
      console.log("Data anak berhasil dihapus!");
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };
  
  return { children, loading, fetchAnak, addAnak, updateAnak, deleteAnak, unsubscribe };
});
