// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  modules: ["@nuxt/ui", "nuxt-open-fetch"],
  openFetch: {
    clients: {
      books: {
        baseURL:"https://63c10327716562671870f959.mockapi.io"
      }
    },
  },
  devtools: { enabled: true },
});