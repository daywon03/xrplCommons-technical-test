<template>
  <div class="create-page">
    <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>
    <h1>🎨 Create & Customize NFT</h1>

    <!-- Step 1: Select a clock -->
    <label for="clock-select">Select a NISAR Clock:</label>
    <select id="clock-select" v-model="selectedClockId" @change="loadImage">
      <option disabled value="">-- Choose a clock --</option>
      <option v-for="clock in clocks" :key="clock.id" :value="clock.id">{{ clock.name }}</option>
    </select>

    <div v-if="imageLoaded" class="editor">
      <!-- Step 2: Image manipulation controls -->
      <div class="controls">
        <div class="control-group">
          <label>Brightness: {{ brightness }}%</label>
          <input type="range" v-model.number="brightness" min="0" max="200" @input="applyFilters" />
        </div>
        <div class="control-group">
          <label>Color Overlay</label>
          <input type="color" v-model="colorOverlay" @input="applyFilters" />
          <label>Opacity: {{ overlayOpacity }}%</label>
          <input type="range" v-model.number="overlayOpacity" min="0" max="100" @input="applyFilters" />
        </div>
        <div class="control-group">
          <label>Gradient</label>
          <select v-model="gradientType" @change="applyFilters">
            <option value="none">None</option>
            <option value="warm">Warm (Orange-Red)</option>
            <option value="cool">Cool (Blue-Purple)</option>
            <option value="vintage">Vintage (Sepia)</option>
            <option value="neon">Neon (Green-Pink)</option>
          </select>
        </div>
        <button class="reset-btn" @click="resetFilters">Reset Filters</button>
      </div>

      <!-- Canvas preview -->
      <canvas ref="canvasRef" class="preview-canvas"></canvas>
      <p class="clock-name">{{ selectedClock?.name }}</p>

      <!-- Step 3 & 4: Upload to IPFS + Mint via Xaman -->
      <button class="mint-btn" :disabled="isMinting" @click="uploadAndMint">
        {{ mintStatus }}
      </button>

      <!-- Xaman QR -->
      <div v-if="xamanQrUrl" class="qr-section">
        <p>Approve this NFT mint in Xaman:</p>
        <img :src="xamanQrUrl" alt="Xaman QR" class="qr-code" />
        <p class="hint">Or <a :href="xamanDeepLink" target="_blank">open in Xaman</a></p>
        <p class="waiting">Waiting for approval...</p>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Confirmation -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>✅ NFT Minted via Xaman!</h2>
        <p><strong>Clock:</strong> {{ mintedClockName }}</p>
        <p><strong>IPFS URL:</strong></p>
        <code>{{ ipfsUrl }}</code>
        <p><strong>Tx Hash:</strong></p>
        <code>{{ txHash }}</code>
        <a :href="`https://testnet.xrpl.org/transactions/${txHash}`" target="_blank" class="explorer-link">
          View on XRPL Explorer →
        </a>
        <button class="close-btn" @click="showModal = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const clocks = [
  { id: 1, name: 'Precision', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Precision.jpg' },
  { id: 2, name: 'Consistency', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Consistency.jpg' },
  { id: 3, name: 'Coverage', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Coverage.jpg' },
  { id: 4, name: 'Emergency', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Emergency.jpg' },
  { id: 5, name: 'Collapse', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Collapse.jpg' },
  { id: 6, name: 'Sea Level Rise', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/RisingWater.jpg' },
  { id: 7, name: 'Repletion and Depletion', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Agriculture.jpg' },
  { id: 8, name: 'Deforestation', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Deforestation.jpg' },
  { id: 9, name: 'Air Quality', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Pollution.jpg' },
  { id: 10, name: 'Sinkhole', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Sinkhole.jpg' },
  { id: 11, name: 'Earthquake', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Earthquake.jpg' },
  { id: 12, name: 'Earth in Flux', imageUrl: 'https://d2pn8kiwq2w21t.cloudfront.net/original_images/Illusion.jpg' },
]

const selectedClockId = ref<number | string>('')
const selectedClock = computed(() => clocks.find(c => c.id === selectedClockId.value) || null)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageLoaded = ref(false)
let originalImage: HTMLImageElement | null = null

// Filter controls
const brightness = ref(100)
const colorOverlay = ref('#ff6600')
const overlayOpacity = ref(0)
const gradientType = ref('none')

// Minting state
const isMinting = ref(false)
const mintStatus = ref('Upload to IPFS & Mint NFT')
const errorMessage = ref('')
const xamanQrUrl = ref('')
const xamanDeepLink = ref('')
const showModal = ref(false)
const txHash = ref('')
const ipfsUrl = ref('')
const mintedClockName = ref('')

function loadImage() {
  if (!selectedClock.value || !canvasRef.value) return
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    originalImage = img
    imageLoaded.value = true
    resetFilters()
    applyFilters()
  }
  img.src = selectedClock.value.imageUrl
}

function resetFilters() {
  brightness.value = 100
  colorOverlay.value = '#ff6600'
  overlayOpacity.value = 0
  gradientType.value = 'none'
  applyFilters()
}

function applyFilters() {
  if (!canvasRef.value || !originalImage) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  const maxW = 500
  const ratio = Math.min(maxW / originalImage.width, 1)
  canvas.width = originalImage.width * ratio
  canvas.height = originalImage.height * ratio

  // Draw original image with brightness
  ctx.filter = `brightness(${brightness.value}%)`
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height)
  ctx.filter = 'none'

  // Color overlay
  if (overlayOpacity.value > 0) {
    ctx.globalAlpha = overlayOpacity.value / 100
    ctx.fillStyle = colorOverlay.value
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
  }

  // Gradient overlay
  if (gradientType.value !== 'none') {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    if (gradientType.value === 'warm') {
      grad.addColorStop(0, 'rgba(255,100,0,0.3)')
      grad.addColorStop(1, 'rgba(255,0,0,0.3)')
    } else if (gradientType.value === 'cool') {
      grad.addColorStop(0, 'rgba(0,100,255,0.3)')
      grad.addColorStop(1, 'rgba(128,0,255,0.3)')
    } else if (gradientType.value === 'vintage') {
      grad.addColorStop(0, 'rgba(180,140,100,0.4)')
      grad.addColorStop(1, 'rgba(120,80,40,0.3)')
    } else if (gradientType.value === 'neon') {
      grad.addColorStop(0, 'rgba(0,255,100,0.3)')
      grad.addColorStop(1, 'rgba(255,0,200,0.3)')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

async function uploadAndMint() {
  if (!canvasRef.value || !selectedClock.value) return
  isMinting.value = true
  errorMessage.value = ''
  xamanQrUrl.value = ''

  try {
    // Step 1: Export canvas to blob
    mintStatus.value = 'Exporting image...'
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvasRef.value!.toBlob(b => b ? resolve(b) : reject(new Error('Canvas export failed')), 'image/png')
    })

    // Step 2: Upload to IPFS via server
    mintStatus.value = 'Uploading to IPFS...'
    const formData = new FormData()
    formData.append('file', blob, `${selectedClock.value.name}-custom.png`)
    formData.append('name', selectedClock.value.name)

    const uploadResult = await $fetch<{ ipfsUrl: string }>('/api/upload-ipfs', {
      method: 'POST',
      body: formData,
    })
    ipfsUrl.value = uploadResult.ipfsUrl

    // Step 3: Create Xaman NFTokenMint payload
    mintStatus.value = 'Creating Xaman request...'
    const payload = await $fetch<{ uuid: string; qrUrl: string; deepLink: string }>('/api/xaman/mint', {
      method: 'POST',
      body: { uri: uploadResult.ipfsUrl },
    })

    xamanQrUrl.value = payload.qrUrl
    xamanDeepLink.value = payload.deepLink

    // Step 4: Poll for result
    mintStatus.value = 'Waiting for Xaman approval...'
    const result = await pollPayload(payload.uuid)

    if (result.signed && result.txHash) {
      txHash.value = result.txHash
      mintedClockName.value = selectedClock.value.name
      showModal.value = true
      xamanQrUrl.value = ''
    } else {
      errorMessage.value = 'Mint was rejected in Xaman.'
      xamanQrUrl.value = ''
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Minting failed.'
    console.error(err)
  } finally {
    isMinting.value = false
    mintStatus.value = 'Upload to IPFS & Mint NFT'
  }
}

async function pollPayload(uuid: string) {
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const status = await $fetch<{ resolved: boolean; signed: boolean; txHash?: string }>(`/api/xaman/status?uuid=${uuid}`)
    if (status.resolved) return status
  }
  throw new Error('Payload timed out')
}
</script>

<style scoped>
.create-page {
  max-width: 700px; margin: 0 auto; padding: 2rem;
  font-family: Arial, sans-serif; background: #0f0f1a;
  color: #fff; min-height: 100vh;
}
.back-link { color: #8b5cf6; text-decoration: none; }
h1 { margin: 1.5rem 0; }
label { display: block; margin-bottom: 0.5rem; color: #ccc; }
select, input[type="text"] {
  width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #333;
  background: #1a1a2e; color: #fff; font-size: 1rem; box-sizing: border-box;
}
.editor { margin-top: 1.5rem; }
.controls {
  background: #1a1a2e; padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem;
}
.control-group { margin-bottom: 1rem; }
.control-group label { margin-bottom: 0.3rem; font-size: 0.9rem; }
input[type="range"] { width: 100%; }
input[type="color"] { width: 50px; height: 32px; border: none; cursor: pointer; vertical-align: middle; margin-right: 1rem; }
.reset-btn {
  background: #555; color: #fff; border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer; font-size: 0.9rem;
}
.preview-canvas {
  display: block; max-width: 100%; border-radius: 10px; border: 2px solid #333; margin: 0 auto;
}
.clock-name { text-align: center; color: #aaa; margin-top: 0.5rem; }
.mint-btn {
  display: block; width: 100%; margin-top: 1.5rem; padding: 14px;
  background: #8b5cf6; color: #fff; border: none; border-radius: 8px;
  font-size: 1.1rem; font-weight: bold; cursor: pointer;
}
.mint-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.qr-section { text-align: center; margin-top: 1.5rem; padding: 1.5rem; background: #1a1a2e; border-radius: 10px; }
.qr-code { width: 200px; height: 200px; margin: 1rem auto; border-radius: 8px; }
.hint { color: #888; font-size: 0.9rem; }
.hint a { color: #8b5cf6; }
.waiting { color: #f59e0b; font-style: italic; }
.error { color: #ef4444; margin-top: 1rem; }
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: #1a1a2e; padding: 2rem; border-radius: 12px;
  max-width: 500px; width: 90%; text-align: center;
}
.modal code { display: block; background: #0f0f1a; padding: 8px; border-radius: 6px; font-size: 0.75rem; word-break: break-all; margin: 0.5rem 0 1rem; }
.explorer-link { display: inline-block; color: #8b5cf6; font-weight: bold; text-decoration: none; margin-bottom: 1rem; }
.close-btn { display: block; width: 100%; margin-top: 1rem; padding: 10px; background: #333; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
</style>
