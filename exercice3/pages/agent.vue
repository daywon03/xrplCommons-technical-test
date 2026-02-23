<template>
  <div class="agent-page">
    <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>

    <h1>💡 Evaluate Your Business Idea</h1>

    <!-- Dialogue box -->
    <div class="dialogue-box">
      <textarea
        v-model="idea"
        placeholder="Describe your business idea here..."
        rows="6"
        :disabled="isLoading"
      ></textarea>

      <button class="send-btn" :disabled="!idea.trim() || isLoading" @click="submitIdea">
        {{ isLoading ? 'Analyzing...' : 'Send' }}
      </button>
    </div>

    <!-- Error message -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Score result -->
    <div v-if="score !== null" class="result">
      <div class="score-circle" :class="scoreClass">
        <span class="score-number">{{ score }}</span>
        <span class="score-label">/10</span>
      </div>
      <h2>Credibility Score</h2>
      <p class="feedback">{{ feedback }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const idea = ref('')
const score = ref<number | null>(null)
const feedback = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const scoreClass = computed(() => {
  if (score.value === null) return ''
  if (score.value >= 7) return 'score-high'
  if (score.value >= 4) return 'score-mid'
  return 'score-low'
})

async function submitIdea() {
  if (!idea.value.trim()) return

  isLoading.value = true
  errorMessage.value = ''
  score.value = null
  feedback.value = ''

  try {
    const response = await $fetch<{ score: number; feedback: string }>('/api/evaluate', {
      method: 'POST',
      body: { idea: idea.value },
    })

    score.value = response.score
    feedback.value = response.feedback
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Something went wrong. Please try again.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.agent-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  background: #0f0f1a;
  color: #fff;
  min-height: 100vh;
}

.back-link {
  color: #8b5cf6;
  text-decoration: none;
}

h1 {
  margin: 1.5rem 0;
}

.dialogue-box {
  margin-top: 1rem;
}

textarea {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #1a1a2e;
  color: #fff;
  font-size: 1rem;
  font-family: Arial, sans-serif;
  resize: vertical;
  box-sizing: border-box;
}

textarea::placeholder {
  color: #666;
}

.send-btn {
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 14px;
  background: #8b5cf6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #ef4444;
  margin-top: 1rem;
}

.result {
  margin-top: 2rem;
  text-align: center;
}

.score-circle {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid;
  margin: 0 auto 1rem;
  flex-direction: row;
  align-items: center;
}

.score-number {
  font-size: 3rem;
  font-weight: bold;
}

.score-label {
  font-size: 1.2rem;
  color: #aaa;
}

.score-high {
  border-color: #10b981;
  color: #10b981;
}

.score-mid {
  border-color: #f59e0b;
  color: #f59e0b;
}

.score-low {
  border-color: #ef4444;
  color: #ef4444;
}

.result h2 {
  margin-bottom: 0.5rem;
}

.feedback {
  color: #ccc;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}
</style>
