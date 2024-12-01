<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
let nomorSurat = parseInt(route.params.nomor);
const surat = ref(null);
const error = ref(null);
const isLoading = ref(true);
const playingAyat = ref(null);
const playingAyatFull = ref(null);
const selectedQori = ref("01");
const searchQuery = ref("");
const searchResultIndex = ref(null);

console.log(searchQuery.value);

const fetchAyat = async () => {
  try {
    const response = await fetch(
      `https://equran.id/api/v2/surat/${nomorSurat}`
    );
    const json = await response.json();
    surat.value = json.data;
  } catch (err) {
    error.value = "Gagal memuat data ayat";
  } finally {
    isLoading.value = false;
  }
};

const nextSuratHandler = async () => {
  nomorSurat++;
  router.push({ name: "Ayat", params: { nomor: nomorSurat } });
  await fetchAyat();
};

const prevSuratHandler = async () => {
  if (nomorSurat > 1) {
    nomorSurat--;
    router.push({ name: "Ayat", params: { nomor: nomorSurat } });
    await fetchAyat();
  }
};

const toggleAudioPerAyat = (audioUrl, ayatNomor) => {
  if (playingAyat.value && playingAyat.value.ayatNomor === ayatNomor) {
    playingAyat.value.audio.pause();
    playingAyat.value = null;
  } else {
    if (playingAyat.value) {
      playingAyat.value.audio.pause();
    }
    const audio = new Audio(audioUrl);
    audio.play();
    playingAyat.value = { ayatNomor, audio };
    audio.onended = () => {
      playingAyat.value = null;
    };
  }
};

const toggleAudioFull = (audioUrl) => {
  if (playingAyatFull.value && playingAyatFull.value.audioUrl === audioUrl) {
    playingAyatFull.value.audio.pause();
    playingAyatFull.value = null;
  } else {
    if (playingAyatFull.value) {
      playingAyatFull.value.audio.pause();
    }
    const audio = new Audio(audioUrl);
    audio.play();
    playingAyatFull.value = { audioUrl, audio };
    audio.onended = () => {
      playingAyatFull.value = null;
    };
  }
};

const scrollToAyat = () => {
  if (searchResultIndex.value !== null) {
    const ayatElement = document.getElementById(
      `ayat-${searchResultIndex.value}`
    );
    if (ayatElement) {
      ayatElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

watch(searchQuery, () => {
  searchResultIndex.value = null;
  if (searchQuery.value) {
    const resultIndex = surat.value?.ayat.findIndex((ayat) =>
      ayat.nomorAyat.toString().includes(searchQuery.value)
    );
    if (resultIndex !== -1) {
      searchResultIndex.value = resultIndex;
      scrollToAyat();
    }
  }
});

onMounted(fetchAyat);

function convertToArabicNumbers(number) {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((char) => {
      return isNaN(char) ? char : arabicNumbers[char];
    })
    .join("");
}
</script>

<template>
  <div class="container mt-4">
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="isLoading" class="vh-100">
      <p class="card-text placeholder-glow text-center">
        <span class="placeholder col-4"></span>
        <span class="placeholder col-2"></span>
        <span class="placeholder col-4"></span>
        <span class="placeholder col-7"></span>
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
        <span class="placeholder w-100"></span>
      </p>
    </div>
    <div v-else>
      <div class="text-center">
        <h2>
          {{ surat.namaLatin }}
          <span class="title-arabic-text fs-2">({{ surat.nama }})</span>
        </h2>
        <p>{{ surat.arti }}</p>
      </div>

      <div class="d-flex justify-content-center my-4 gap-2">
        <strong>
          <span class="badge text-bg-light py-2">
            <i class="bi bi-view-list me-1"></i>
            Surat ke-{{ surat.nomor }}
          </span>
        </strong>
        <strong>
          <span class="badge text-bg-light py-2">
            <i class="bi bi-box-fill me-1"></i>
            {{ surat.jumlahAyat }} Ayat
          </span>
        </strong>
        <strong>
          <span class="badge text-bg-light py-2">
            <i class="bi bi-geo-fill me-1"></i>
            {{ surat.tempatTurun }}
          </span>
        </strong>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 col-12">
          <div class="row">
            <div class="col-10">
              <select
                class="form-select py-2"
                v-model="selectedQori"
                aria-label="Default select example"
              >
                <option value="01">Syeikh Abdullah Al-Juhany</option>
                <option value="02">Syeikh Abdul Muhsin Al-Qasim</option>
                <option value="03">Syeikh Abdurrahman As-Sudais</option>
                <option value="04">Syeikh Ibrahim Al-Dossari</option>
                <option value="05">Syeikh Misyari Rasyid Al-Afasy</option>
              </select>
            </div>
            <div class="col-2">
              <h2 style="cursor: pointer" title="Play Audio Full">
                <i
                  :class="
                    playingAyatFull?.audioUrl === surat.audioFull[selectedQori]
                      ? 'bi bi-pause-circle-fill'
                      : 'bi bi-play-circle-fill'
                  "
                  @click="toggleAudioFull(surat.audioFull[selectedQori])"
                ></i>
              </h2>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-9 mt-md-0 mt-2">
          <form class="d-flex" role="search" @submit.prevent>
            <input
              class="form-control py-2"
              type="number"
              placeholder="Cari Nomor Ayat..."
              aria-label="Search"
              v-model="searchQuery"
            />
          </form>
        </div>
        <div class="col-md-2 col-3 mt-md-0 mt-2">
          <div class="d-flex justify-content-end gap-4 next-back">
            <span class="fs-2">
              <i
                class="bi bi-arrow-left-circle back-surat"
                @click="prevSuratHandler"
              ></i>
            </span>
            <span class="fs-2">
              <i
                class="bi bi-arrow-right-circle-fill next-surat"
                @click="nextSuratHandler"
              ></i>
            </span>
          </div>
        </div>
      </div>

      <div v-for="(ayat, index) in surat.ayat" :key="ayat.nomorAyat">
        <div
          class="row my-3"
          :id="`ayat-${index}`"
          :class="{
            'bg-info-subtle':
              searchQuery && ayat.nomorAyat.toString().includes(searchQuery),
          }"
        >
          <div class="col-2 col-md-1">
            <div :id="searchQuery" class="row">
              <div class="col-12">
                <strong>{{ surat.nomor }} : {{ ayat.nomorAyat }} </strong>
              </div>
              <div class="col-12">
                <h3 class="mt-3">
                  <i
                    :class="
                      playingAyat?.ayatNomor === ayat.nomorAyat
                        ? 'bi bi-pause-circle-fill'
                        : 'bi bi-play-circle-fill'
                    "
                    style="cursor: pointer"
                    @click="
                      toggleAudioPerAyat(
                        ayat.audio[selectedQori],
                        ayat.nomorAyat
                      )
                    "
                  ></i>
                </h3>
              </div>
              <div class="col-12">
                <h3 class="mt-3"><i class="bi bi-book"></i></h3>
              </div>
            </div>
          </div>
          <div class="col-10 col-md-11">
            <p class="text-end arabic-text fs-3">
              {{ ayat.teksArab }}
              <span class="ms-2 fs-4"
                >({{ convertToArabicNumbers(ayat.nomorAyat) }})</span
              >
            </p>
            <p class="text-muted fst-italic text-end">({{ ayat.teksLatin }})</p>
            <br />
            <p class="text-end">{{ ayat.teksIndonesia }}</p>
          </div>
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media screen and (min-width: 768px) {
  .next-back {
    margin-top: -5px;
  }
}
</style>
