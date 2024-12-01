<script setup>
import { ref, computed, onMounted } from "vue";

const data = ref([]);
const searchQuery = ref("");
const sortOrder = ref("asc");
const error = ref(null);
const isLoading = ref(true);

const fetchSurat = async () => {
  try {
    const response = await fetch("https://equran.id/api/v2/surat");
    const json = await response.json();
    data.value = json.data;
  } catch (err) {
    error.value = "Gagal memuat data";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchSurat);

const filteredData = computed(() => {
  if (!data.value) return [];

  let filtered = data.value.filter((surat) =>
    surat.namaLatin.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  filtered.sort((a, b) => {
    if (sortOrder.value === "asc") {
      return a.nomor - b.nomor;
    } else {
      return b.nomor - a.nomor;
    }
  });

  return filtered;
});
</script>

<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-md-10 col-12">
        <form class="d-flex" role="search" @submit.prevent>
          <input
            class="form-control py-2"
            type="search"
            placeholder="Cari Surat..."
            aria-label="Search"
            v-model="searchQuery"
          />
        </form>
      </div>
      <div class="col-md-2 col-12 mt-md-0 mt-2">
        <select class="form-select py-2 text-muted" v-model="sortOrder">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4">
      {{ error }}
    </div>

    <div v-else-if="isLoading" class="vh-100 mt-4">
      <p class="card-text placeholder-glow">
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
      </p>
    </div>

    <div v-else>
      <div v-if="filteredData.length > 0" class="row mt-4">
        <div
          class="col-md-3 col-12 my-2"
          v-for="item in filteredData"
          :key="item.nomor"
        >
          <RouterLink :to="`/surat/${item.nomor}`" class="text-decoration-none">
            <div class="card card-surat">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <h5 class="card-title">{{ item.namaLatin }}</h5>
                  <h5 class="card-title title-arabic-text">{{ item.nama }}</h5>
                </div>
                <p>{{ item.arti }}</p>
                <div class="d-flex justify-content-between mt-4">
                  <small>Surat ke-{{ item.nomor }}</small>
                  <small>{{ item.jumlahAyat }} Ayat</small>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
      <div v-else class="vh-100">
        <div class="alert alert-danger mt-4 text-center" role="alert">
          Surat tidak ditemukan
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-surat:hover {
  transform: scale(1.03);
  border: 1px solid #e1e1e1;
  box-shadow: 0 0 10px #adadad;
}
</style>
