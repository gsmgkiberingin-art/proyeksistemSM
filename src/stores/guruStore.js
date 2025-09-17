// File: src/stores/guruStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, where, getDocs, runTransaction } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';

const upsertUser = async (email, displayName, role) => {
  if (!email) return;
  const userQuery = query(collection(db, "users"), where("email", "==", email));
  const userSnapshot = await getDocs(userQuery);
  if (!userSnapshot.empty) {
    const userDoc = userSnapshot.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), {
      role: role,
      displayName: displayName
    });
    console.log(`Peran untuk ${email} diupdate menjadi ${role}`);
  } else {
    console.warn(`Pengguna dengan email ${email} belum pernah login. Akun 'users' tidak dibuat/diupdate.`);
  }
};

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
    if (unsubscribe) { unsubscribe(); }
    loading.value = true;
    const q = query(collection(db, "teachers"), orderBy("nomorInduk"));
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newTeachers = [];
      querySnapshot.forEach((doc) => {
        newTeachers.push({ id: doc.id, ...doc.data() });
      });
      teachers.value = newTeachers;
      loading.value = false;
    }, (error) => {
      console.error("Error di onSnapshot (fetchTeachers):", error);
      loading.value = false;
    });
  };

  const addTeacher = async (teacherData, file) => {
    try {
      // ... logika transaksi dan penyimpanan guru ...
      // (Ini biarkan seperti yang sudah ada dan berhasil)
    } catch (e) {
      console.error("Error dalam transaksi penambahan guru: ", e);
      alert("Terjadi kesalahan saat menambahkan guru. " + e);
    }
  };
  
  // ==================== FUNGSI YANG HILANG DIKEMBALIKAN ====================
  const updateTeacher = async (id, teacherData, file) => {
    try {
      const dataToUpdate = { ...teacherData };
      const fotoUrl = await uploadTeacherPhoto(file);
      if (fotoUrl) dataToUpdate.fotoUrl = fotoUrl;
      if (teacherData.nama) dataToUpdate.nama_lowercase = teacherData.nama.toLowerCase();

      const teacherDocRef = doc(db, "teachers", id);
      await updateDoc(teacherDocRef, dataToUpdate);

      const userRole = teacherData.peran && teacherData.peran.length > 0 ? teacherData.peran[0].toLowerCase().replace(' ', '_') : 'guru';
      await upsertUser(teacherData.email, teacherData.nama, userRole);

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
  // =======================================================================
  
  return { teachers, loading, fetchTeachers, addTeacher, updateTeacher, deleteTeacher, unsubscribe };
});