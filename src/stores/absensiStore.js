// File: src/stores/absensiStore.js
// Tujuan: Mengelola semua data dan logika untuk fitur absensi anak.

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from './authStore';

export const useAbsensiStore = defineStore('absensiStore', () => {
  // State
  const loading = ref(false);
  const anakPerKelas = ref([]);
  const daftarHadir = ref(new Set());
  const dashboardSummary = ref(null); // State untuk dasbor

  // Actions
  const fetchAnakDanAbsensi = async (tanggal, lokasi, jam, kelas) => {
    loading.value = true;
    anakPerKelas.value = [];
    daftarHadir.value.clear();
    try {
      const anakQuery = query(collection(db, "children"), where("kelasSM", "==", kelas));
      const anakSnapshot = await getDocs(anakQuery);
      anakPerKelas.value = anakSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const absensiId = `${tanggal}_${lokasi}_${jam}`;
      const absensiRef = doc(db, "attendance_children", absensiId);
      const absensiSnap = await getDoc(absensiRef);
      if (absensiSnap.exists()) {
        const dataAbsensi = absensiSnap.data();
        const kehadiranKelasIni = dataAbsensi[kelas]?.anakHadir || [];
        daftarHadir.value = new Set(kehadiranKelasIni);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal memuat data anak dan absensi.");
    } finally {
      loading.value = false;
    }
  };

  const simpanAbsensi = async (tanggal, lokasi, jam, kelas) => {
    loading.value = true;
    const authStore = useAuthStore();
    if (!authStore.user) {
      alert("Anda harus login untuk menyimpan data.");
      loading.value = false;
      return;
    }
    try {
      const absensiId = `${tanggal}_${lokasi}_${jam}`;
      const absensiRef = doc(db, "attendance_children", absensiId);
      const dataKelas = {
        anakHadir: Array.from(daftarHadir.value),
        totalHadir: daftarHadir.value.size,
        dicatatOleh: authStore.user.email,
        terakhirUpdate: new Date(),
      };
      await setDoc(absensiRef, {
        [kelas]: dataKelas,
        tanggal: tanggal,
        lokasi: lokasi,
        jam: jam,
      }, { merge: true });
      alert(`Absensi untuk kelas ${kelas} berhasil disimpan!`);
    } catch (error) {
      console.error("Error saving attendance: ", error);
      alert("Gagal menyimpan absensi.");
    } finally {
      loading.value = false;
    }
  };

  const toggleKehadiran = (anakId) => {
    if (daftarHadir.value.has(anakId)) {
      daftarHadir.value.delete(anakId);
    } else {
      daftarHadir.value.add(anakId);
    }
  };

  const fetchDashboardSummary = async (tanggal) => {
    loading.value = true;
    dashboardSummary.value = null;
    try {
      const q = query(collection(db, "attendance_children"), where("tanggal", "==", tanggal));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        dashboardSummary.value = { totalHadir: 0, rincian: [] };
        return;
      }
      
      let totalHadirKeseluruhan = 0;
      const rincianPerLokasi = {};

      querySnapshot.forEach(doc => {
        const data = doc.data();
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'object' && data[key] !== null && data[key].hasOwnProperty('totalHadir')) {
            const kelasData = data[key];
            const lokasi = data.lokasi;
            const jam = data.jam;
            const namaKelas = key;
            totalHadirKeseluruhan += kelasData.totalHadir;
            if (!rincianPerLokasi[lokasi]) {
              rincianPerLokasi[lokasi] = { lokasi: lokasi, totalHadir: 0, kelas: [] };
            }
            rincianPerLokasi[lokasi].totalHadir += kelasData.totalHadir;
            rincianPerLokasi[lokasi].kelas.push({
              nama: namaKelas,
              jam: jam,
              hadir: kelasData.totalHadir
            });
          }
        });
      });

      dashboardSummary.value = {
        totalHadir: totalHadirKeseluruhan,
        rincian: Object.values(rincianPerLokasi)
      };
    } catch (error) {
      console.error("Error fetching dashboard summary: ", error);
      alert("Gagal memuat ringkasan dasbor.");
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    anakPerKelas,
    daftarHadir,
    dashboardSummary,
    fetchAnakDanAbsensi,
    simpanAbsensi,
    toggleKehadiran,
    fetchDashboardSummary,
  };
});