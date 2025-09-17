// File: src/stores/anakStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, runTransaction, where, getDocs } from 'firebase/firestore';
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
  }
};

export const useAnakStore = defineStore('anakStore', () => {
  const children = ref([]);
  const loading = ref(false);
  let unsubscribe = null;

  const uploadAnakPhoto = async (file) => {
    if (!file) return null;
    const filePath = `anak_photos/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const fetchAnak = () => {
    if (unsubscribe) { unsubscribe(); }
    
    console.log("Memulai listener 'fetchAnak' (onSnapshot)...");
    loading.value = true;
    const q = query(collection(db, "children"), orderBy("namaLengkap"));
    
    unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log(`onSnapshot (anak): Data terdeteksi. Ditemukan ${querySnapshot.size} dokumen.`);
      const newChildren = [];
      querySnapshot.forEach((doc) => {
        newChildren.push({ id: doc.id, ...doc.data() });
      });
      children.value = newChildren;
      console.log("onSnapshot (anak): State 'children' diperbarui.", children.value);
      loading.value = false;
    }, (error) => {
      console.error("Error di onSnapshot (fetchAnak):", error);
      alert("Gagal memuat data anak: " + error.message);
      loading.value = false;
    });
  };

  const addAnak = async (anakData, file) => {
    try {
      const normalizedName = anakData.namaLengkap.toLowerCase().trim();
      const q = query(collection(db, "children"), where("namaLengkap_lowercase", "==", normalizedName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert(`Error: Anak dengan nama "${anakData.namaLengkap}" sudah terdaftar.`);
        return;
      }
      
      const counterRef = doc(db, "counters", "childCounter");
      const newId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          transaction.set(counterRef, { lastId: 2000 });
          return 2001;
        }
        const newLastId = counterDoc.data().lastId + 1;
        transaction.update(counterRef, { lastId: newLastId });
        return newLastId;
      });
      
      const fotoUrl = await uploadAnakPhoto(file);
      const dataToSave = {
        ...anakData,
        fotoUrl: fotoUrl || '',
        nomorInduk: `A-${newId}`,
        namaLengkap_lowercase: normalizedName,
        createdAt: new Date()
      };

      await addDoc(collection(db, "children"), dataToSave);
      
      if (anakData.emailOrangTua) {
        await upsertUser(anakData.emailOrangTua, anakData.namaOrangTua, 'ortu');
      }

      console.log("Data anak berhasil ditambahkan dengan NIA: " + dataToSave.nomorInduk);

    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Terjadi kesalahan saat menambahkan data anak: " + e.message);
    }
  };
  
  const updateAnak = async (id, anakData, file) => {
    try {
      const dataToUpdate = { ...anakData };
      const fotoUrl = await uploadAnakPhoto(file);
      if (fotoUrl) dataToUpdate.fotoUrl = fotoUrl;
      if (dataToUpdate.namaLengkap) {
          dataToUpdate.namaLengkap_lowercase = dataToUpdate.namaLengkap.toLowerCase().trim();
      }

      const anakDocRef = doc(db, "children", id);
      await updateDoc(anakDocRef, dataToUpdate);

      if (anakData.emailOrangTua) {
        await upsertUser(anakData.emailOrangTua, anakData.namaOrangTua, 'ortu');
      }

    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteAnak = async (id) => {
    try {
      await deleteDoc(doc(db, "children", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };
  
  return { children, loading, fetchAnak, addAnak, updateAnak, deleteAnak, unsubscribe };
});