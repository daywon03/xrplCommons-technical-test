<template>
  <div class="login-page">
    <NuxtLink to="/" class="back-link">← Back to Comments</NuxtLink>
    <h1>🔐 Admin Login</h1>

    <form @submit.prevent="login">
      <label for="username">Username</label>
      <input id="username" v-model="username" type="text" placeholder="admin" />

      <label for="password">Password</label>
      <input id="password" v-model="password" type="password" placeholder="••••••" />

      <button type="submit" :disabled="!username.trim() || !password.trim() || isLoading">
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function login() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })

    // Store token in localStorage
    localStorage.setItem('admin_token', response.token)

    // Redirect to homepage
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  background: #0f0f1a;
  color: #fff;
  min-height: 100vh;
}

.back-link { color: #3b82f6; text-decoration: none; }
h1 { margin: 1.5rem 0; }

form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  color: #ccc;
}

form input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #1a1a2e;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}

form button {
  width: 100%;
  margin-top: 1.5rem;
  padding: 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}
form button:disabled { opacity: 0.5; cursor: not-allowed; }

.error { color: #ef4444; margin-top: 1rem; }
</style>
