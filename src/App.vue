<script setup>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
</script>

<template>
  <main>
    <Header />
    <RouterView />
    <Footer />
  </main>
</template>
