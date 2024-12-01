import { createRouter, createWebHistory } from "vue-router";
import Surat from "@/views/Surat.vue";
import Ayat from "@/views/Ayat.vue";

const routes = [
  {
    path: "/",
    name: "Surat",
    component: Surat,
  },
  {
    path: "/surat/:nomor",
    name: "Ayat",
    component: Ayat,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
