export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  runtimeConfig: {
    xamanApiKey: process.env.XAMAN_API_KEY || '',
    xamanApiSecret: process.env.XAMAN_API_SECRET || '',
    pinataApiKey: process.env.PINATA_API_KEY || '',
    pinataSecretKey: process.env.PINATA_SECRET_KEY || '',
  },
})
