// File: src/firebase.js
// Tujuan: Inisialisasi Firebase dan ekspor auth, db, storage

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Konfigurasi Firebase (dari Project Settings > General)
const firebaseConfig = {
  apiKey: "AIzaSyA4rNxqPPhrqsFygyPH6afMkAn7_reqPxM",
  authDomain: "app-sekolah-minggu.firebaseapp.com",
  projectId: "app-sekolah-minggu",
  storageBucket: "app-sekolah-minggu.appspot.com", // ✅ FIXED
  messagingSenderId: "444901641461",
  appId: "1:444901641461:web:34b3cd2028cedf4e6749bc",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
