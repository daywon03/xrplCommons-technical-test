<template>
  <div class="page">
    <header>
      <h1>💬 Comments</h1>
      <NuxtLink v-if="!token" to="/login" class="login-link">Admin Login</NuxtLink>
      <button v-else class="logout-btn" @click="logout">Logout (Admin)</button>
    </header>

    <!-- Post a comment (anyone) -->
    <div class="post-form">
      <input v-model="author" type="text" placeholder="Your name" />
      <textarea v-model="content" placeholder="Write a comment..." rows="3"></textarea>
      <button :disabled="!author.trim() || !content.trim()" @click="postComment">Post Comment</button>
    </div>

    <!-- Comments list -->
    <div class="comments-list">
      <div v-for="comment in comments" :key="comment._id" class="comment-card">
        <!-- Edit mode -->
        <div v-if="editingId === comment._id" class="edit-mode">
          <textarea v-model="editContent" rows="2"></textarea>
          <div class="edit-actions">
            <button class="save-btn" @click="saveEdit(comment._id)">Save</button>
            <button class="cancel-btn" @click="editingId = ''">Cancel</button>
          </div>
        </div>
        <!-- Display mode -->
        <div v-else>
          <div class="comment-header">
            <strong>{{ comment.author }}</strong>
            <span class="date">{{ new Date(comment.createdAt).toLocaleString() }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          <!-- Admin actions -->
          <div v-if="token" class="admin-actions">
            <button class="edit-btn" @click="startEdit(comment)">✏️ Edit</button>
            <button class="delete-btn" @click="deleteComment(comment._id)">🗑️ Delete</button>
          </div>
        </div>
      </div>
      <p v-if="comments.length === 0" class="no-comments">No comments yet. Be the first!</p>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Comment {
  _id: string
  author: string
  content: string
  createdAt: string
}

const comments = ref<Comment[]>([])
const author = ref('')
const content = ref('')
const token = ref('')
const errorMessage = ref('')
const editingId = ref('')
const editContent = ref('')

onMounted(() => {
  // Restore token from localStorage
  const saved = localStorage.getItem('admin_token')
  if (saved) token.value = saved
  fetchComments()
})

async function fetchComments() {
  try {
    comments.value = await $fetch<Comment[]>('/api/comments')
  } catch (err) {
    console.error(err)
  }
}

async function postComment() {
  if (!author.value.trim() || !content.value.trim()) return
  errorMessage.value = ''
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: { author: author.value, content: content.value },
    })
    content.value = ''
    await fetchComments()
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Failed to post comment'
  }
}

function startEdit(comment: Comment) {
  editingId.value = comment._id
  editContent.value = comment.content
}

async function saveEdit(id: string) {
  try {
    await $fetch(`/api/comments/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { content: editContent.value },
    })
    editingId.value = ''
    await fetchComments()
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Failed to edit comment'
  }
}

async function deleteComment(id: string) {
  if (!confirm('Delete this comment?')) return
  try {
    await $fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    await fetchComments()
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Failed to delete comment'
  }
}

function logout() {
  token.value = ''
  localStorage.removeItem('admin_token')
}
</script>

<style scoped>
.page {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  background: #0f0f1a;
  color: #fff;
  min-height: 100vh;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.login-link { color: #3b82f6; text-decoration: none; }
.logout-btn {
  background: none; border: 1px solid #555; color: #aaa;
  padding: 6px 14px; border-radius: 6px; cursor: pointer;
}

.post-form {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.post-form input, .post-form textarea {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #0f0f1a;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.8rem;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.post-form button {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}
.post-form button:disabled { opacity: 0.5; cursor: not-allowed; }

.comment-card {
  background: #1a1a2e;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.date { color: #666; font-size: 0.85rem; }
.comment-content { color: #ccc; margin: 0; }

.admin-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  background: none;
  border: 1px solid #444;
  color: #aaa;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}
.delete-btn:hover { border-color: #ef4444; color: #ef4444; }
.edit-btn:hover { border-color: #3b82f6; color: #3b82f6; }

.edit-mode textarea {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #3b82f6;
  background: #0f0f1a;
  color: #fff;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}

.edit-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.save-btn { background: #10b981; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }
.cancel-btn { background: #555; color: #fff; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; }

.no-comments { color: #666; text-align: center; }
.error { color: #ef4444; margin-top: 1rem; }
</style>
