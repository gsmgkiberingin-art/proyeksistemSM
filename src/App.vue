<!-- File: src/App.vue -->
<script setup>
import { RouterView } from 'vue-router'
// Tidak perlu lagi memanggil monitorAuthState di sini karena sudah ditangani di main.js
// sebelum aplikasi di-mount. Ini membuat App.vue lebih bersih.
</script>

<template>
  <RouterView />
</template>