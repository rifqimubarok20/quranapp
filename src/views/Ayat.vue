<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
let nomorSurat = parseInt(route.params.nomor);
const surat = ref(null);
const tafsir = ref(null); // Untuk menyimpan data tafsir
const error = ref(null);
const isLoading = ref(true);
const playingAyat = ref(null);
const playingAyatFull = ref(null);
const selectedQori = ref("01");
const searchQuery = ref("");
const searchResultIndex = ref(null);

const fetchData = async () => {
  isLoading.value = true;
  try {
    // Fetch Ayat dan Tafsir secara paralel
    const [ayatResponse, tafsirResponse] = await Promise.all([
      fetch(`https://equran.id/api/v2/surat/${nomorSurat}`),
      fetch(`https://equran.id/api/v2/tafsir/${nomorSurat}`),
    ]);

    const ayatJson = await ayatResponse.json();
    const tafsirJson = await tafsirResponse.json();

    surat.value = ayatJson.data;
    tafsir.value = tafsirJson.data;
  } catch (err) {
    error.value = "Gagal memuat data";
  } finally {
    isLoading.value = false;
  }
};

const nextSuratHandler = async () => {
  nomorSurat++;
  router.push({ name: "Ayat", params: { nomor: nomorSurat } });
  await fetchData(); // Panggil fetchData untuk memperbarui ayat dan tafsir
};

const prevSuratHandler = async () => {
  if (nomorSurat > 1) {
    nomorSurat--;
    router.push({ name: "Ayat", params: { nomor: nomorSurat } });
    await fetchData();
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

// Panggil fetchData saat komponen dimuat
onMounted(fetchData);

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
  <!-- Modal Deskripsi -->
  <div
    class="modal fade"
    id="deskripsi"
    tabindex="-1"
    aria-labelledby="deskripsiLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="deskripsiLabel">
            {{ surat?.namaLatin }} -
            {{ surat?.nama }}
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body" v-html="surat?.deskripsi"></div>
      </div>
    </div>
  </div>

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
          <sup class="info-surat">
            <i
              class="bi bi-info-circle-fill"
              data-bs-toggle="modal"
              data-bs-target="#deskripsi"
            ></i>
          </sup>
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
              <h1 class="play-audio-full" title="Play Audio Full">
                <i
                  :class="
                    playingAyatFull?.audioUrl === surat.audioFull[selectedQori]
                      ? 'bi bi-pause-btn-fill py-2'
                      : 'bi bi-play-btn-fill py-2'
                  "
                  @click="toggleAudioFull(surat.audioFull[selectedQori])"
                ></i>
              </h1>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-9 mt-md-0 mt-2">
          <form class="d-flex" role="search" @submit.prevent>
            <input
              class="form-control"
              type="number"
              placeholder="Cari Nomor Ayat..."
              aria-label="Search"
              v-model="searchQuery"
            />
            <span class="icon-search"
              ><i class="bi bi-search-heart-fill"></i
            ></span>
          </form>
        </div>
        <div class="col-md-2 col-3 mt-md-0 mt-2">
          <div class="d-flex justify-content-end gap-2 next-back">
            <span class="btn-back-surat">
              <i
                class="bi bi-arrow-left-square back-surat"
                @click="prevSuratHandler"
              ></i>
            </span>
            <span class="btn-next-surat">
              <i
                class="bi bi-arrow-right-square-fill next-surat"
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
                        ? 'bi bi-pause-btn-fill'
                        : 'bi bi-play-btn-fill'
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
                <h3 class="mt-3">
                  <i
                    class="bi bi-book"
                    style="cursor: pointer"
                    data-bs-toggle="modal"
                    :data-bs-target="`#tafsir-${index}`"
                  ></i>
                </h3>
              </div>

              <!-- Modal Tafsir -->
              <div
                class="modal fade"
                :id="`tafsir-${index}`"
                tabindex="-1"
                aria-labelledby="tafsirLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-5" id="tafsirLabel">
                        {{ surat?.namaLatin }} -
                        {{ surat?.nama }}
                      </h1>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      ></button>
                    </div>
                    <div class="modal-body text-pre-wrap">
                      {{ tafsir?.tafsir[index].teks }}
                    </div>
                  </div>
                </div>
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
.info-surat {
  font-size: 20px;
}

.play-audio-full {
  cursor: pointer;
  margin: -12.5px;
  font-size: 53px;
}

.back-surat,
.next-surat {
  text-decoration: none;
  cursor: pointer;
}

.back-surat:hover,
.next-surat:hover {
  text-decoration: none;
  color: #adadad;
  cursor: pointer;
}

.next-back {
  margin-top: -4px;
}

.btn-back-surat,
.btn-next-surat {
  font-size: 2rem;
}

.d-flex {
  display: flex;
  align-items: center;
  position: relative;
}

.form-control {
  width: 100%;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-right: 2.5rem;
}

.icon-search {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.4rem;
  z-index: 1;
}

.text-pre-wrap {
  white-space: pre-wrap;
}

@media screen and (min-width: 768px) {
  .play-audio-full {
    cursor: pointer;
    margin-top: -12.5px;
    font-size: 53px;
  }
  .next-back {
    margin-top: -12.5px;
  }
  .btn-back-surat,
  .btn-next-surat {
    font-size: 2.5rem;
  }
}
</style>
