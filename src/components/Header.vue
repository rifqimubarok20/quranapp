<script setup>
import { ref } from "vue";

const darkMode = ref(true);

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  document.body.setAttribute(
    "data-bs-theme",
    darkMode.value ? "dark" : "light"
  );
};
</script>

<template>
  <nav class="navbar navbar-expand-lg container bg-body-tertiary mt-4 rounded">
    <div
      class="container-fluid d-flex justify-content-between align-items-center"
    >
      <RouterLink :to="`/`" class="route-link">
        <strong>
          <span class="fs-2"><i class="bi bi-book-fill"></i></span>
          <span class="fs-2 ms-2">Quran Indonesia</span>
        </strong>
      </RouterLink>
      <button class="btn btn-outline-secondary" @click="toggleDarkMode">
        <i :class="darkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"></i>
      </button>
    </div>
  </nav>
</template>

<style scoped>
button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.route-link {
  text-decoration: none;
  color: inherit;
}
</style>
