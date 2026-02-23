// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  runtimeConfig: {
    xamanApiKey: process.env.XAMAN_API_KEY || '',
    xamanApiSecret: process.env.XAMAN_API_SECRET || '',
  },
})
