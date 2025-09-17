// File: src/stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const userInfo = ref(null);
  const isAuthReady = ref(false);

  const fetchUserInfo = async (firebaseUser) => {
    if (!firebaseUser) {
      userInfo.value = null;
      return;
    }
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      userInfo.value = userSnap.data();
    } else {
      const newUserInfo = {
        uid: firebaseUser.uid, email: firebaseUser.email,
        displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL,
        role: 'ortu'
      };
      await setDoc(userRef, newUserInfo);
      userInfo.value = newUserInfo;
    }
  };

  const monitorAuthState = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (currentUser) => {
        user.value = currentUser;
        await fetchUserInfo(currentUser);
        isAuthReady.value = true;
        resolve(currentUser); // Kirim status user saat promise selesai
      });
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    user.value = null;
    userInfo.value = null;
  };
  
  const isAdmin = () => userInfo.value?.role === 'admin';
  const isGuru = () => ['admin', 'wali_kelas', 'guru'].includes(userInfo.value?.role);

  return {
    user, userInfo, isAuthReady,
    monitorAuthState, handleLogout,
    isAdmin, isGuru
  };
});