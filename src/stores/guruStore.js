// File: src/stores/guruStore.js
// Tujuan: Mengelola semua logika bisnis terkait data guru (CRUD ke Firestore).

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, where, getDocs, runTransaction } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

export const useGuruStore = defineStore('guruStore', () => {
  const teachers = ref([]);
  const loading = ref(false);
  let unsubscribe = null;

  const uploadTeacherPhoto = async (file) => {
    if (!file) return null;
    const filePath = `teacher_photos/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const fetchTeachers = () => {
    loading.value = true;
    const q = query(collection(db, "teachers"), orderBy("nomorInduk"));
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      teachers.value = [];
      querySnapshot.forEach((doc) => {
        teachers.value.push({ id: doc.id, ...doc.data() });
      });
      loading.value = false;
    });
  };

  const addTeacher = async (teacherData, file) => {
    // --- PENGECEKAN DUPLIKAT NAMA (CASE-INSENSITIVE) ---
    // 1. Normalisasi nama input menjadi huruf kecil
    const normalizedName = teacherData.nama.toLowerCase();

    // 2. Buat query untuk mencari di field 'nama_lowercase'
    const nameCheckQuery = query(collection(db, "teachers"), where("nama_lowercase", "==", normalizedName));
    const nameSnapshot = await getDocs(nameCheckQuery);

    if (!nameSnapshot.empty) {
      alert(`Error: Guru dengan nama "${teacherData.nama}" sudah terdaftar (terlepas dari huruf besar/kecil).`);
      return;
    }
    // --- AKHIR PENGECEKAN ---

    try {
      await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'teacherCounter');
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          throw "Dokumen counter guru tidak ditemukan.";
        }

        const lastId = counterDoc.data().lastId || 1000;
        const newId = lastId + 1;
        const formattedId = `G-${String(newId).padStart(4, '0')}`;

        // 3. Tambahkan field 'nama_lowercase' ke data yang akan disimpan
        const newTeacherData = {
          ...teacherData,
          nama_lowercase: normalizedName, // Simpan nama versi lowercase
          nomorInduk: formattedId,
          createdAt: new Date()
        };

        const fotoUrl = await uploadTeacherPhoto(file);
        if (fotoUrl) {
          newTeacherData.fotoUrl = fotoUrl;
        }

        const newTeacherRef = doc(collection(db, "teachers"));
        transaction.set(newTeacherRef, newTeacherData);
        
        transaction.update(counterRef, { lastId: newId });
      });
      console.log("Data guru baru berhasil ditambahkan!");
    } catch (e) {
      console.error("Error dalam transaksi penambahan guru: ", e);
      alert("Terjadi kesalahan saat menambahkan guru. " + e);
    }
  };
  
  const updateTeacher = async (id, teacherData, file) => {
    try {
      const fotoUrl = await uploadTeacherPhoto(file);
      if (fotoUrl) {
        teacherData.fotoUrl = fotoUrl;
      }
      
      // 4. Pastikan 'nama_lowercase' juga diperbarui saat edit
      const dataToUpdate = {
        ...teacherData,
        nama_lowercase: teacherData.nama.toLowerCase()
      };

      const teacherDocRef = doc(db, "teachers", id);
      await updateDoc(teacherDocRef, dataToUpdate);
      console.log("Data guru berhasil diperbarui!");
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteTeacher = async (id) => {
    try {
      await deleteDoc(doc(db, "teachers", id));
      console.log("Data guru berhasil dihapus!");
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };
  
  return { teachers, loading, fetchTeachers, addTeacher, updateTeacher, deleteTeacher, unsubscribe };
});
