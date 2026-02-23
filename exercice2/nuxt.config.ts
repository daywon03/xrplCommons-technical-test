// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 4938,
  },

  vite: {
    server: {
      hmr: {
        port: 4938,
        clientPort: 4938,
      },
      watch: {
        usePolling: true,
      },
    },
  },
})
