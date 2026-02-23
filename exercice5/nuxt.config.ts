export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  devServer: {
    host: '0.0.0.0',
    port: 8374,
  },

  vite: {
    server: {
      hmr: {
        port: 8374,
        clientPort: 8374,
      },
      watch: {
        usePolling: true,
      },
    },
  },

  runtimeConfig: {
    mongoUri: process.env.MONGO_URI || 'mongodb://mongo:27017/comments-app',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-me',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  },
})
