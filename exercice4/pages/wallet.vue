<template>
  <div class="wallet-page">
    <NuxtLink to="/" class="back-link">← Back to Home</NuxtLink>

    <h1>💳 XRP Wallet</h1>

    <!-- Step 1: Connect wallet via Xaman -->
    <div v-if="!walletAddress" class="connect-section">
      <p>Connect your Xaman wallet to get started.</p>
      <button class="btn" :disabled="isConnecting" @click="connectWallet">
        {{ isConnecting ? 'Connecting...' : 'Connect with Xaman' }}
      </button>

      <!-- QR code for sign-in -->
      <div v-if="qrUrl" class="qr-section">
        <p>Scan this QR code with your Xaman app:</p>
        <img :src="qrUrl" alt="Xaman QR Code" class="qr-code" />
        <p class="hint">Or <a :href="deepLink" target="_blank">open in Xaman</a></p>
        <p class="waiting">Waiting for approval...</p>
      </div>
    </div>

    <!-- Step 2: Send XRP form -->
    <div v-if="walletAddress" class="send-section">
      <div class="wallet-info">
        <p>✅ Connected: <code>{{ walletAddress }}</code></p>
        <button class="disconnect-btn" @click="disconnect">Disconnect</button>
      </div>

      <div class="form">
        <label for="recipient">Recipient Address</label>
        <input
          id="recipient"
          v-model="recipient"
          type="text"
          placeholder="rXXXXXXXXXXXXXXXXXXX..."
          :disabled="isSending"
        />

        <label for="amount">Amount (XRP)</label>
        <input
          id="amount"
          v-model="amount"
          type="number"
          step="0.000001"
          min="0.000001"
          placeholder="10"
          :disabled="isSending"
        />

        <button
          class="send-btn"
          :disabled="!recipient.trim() || !amount || isSending"
          @click="sendXRP"
        >
          {{ isSending ? 'Processing...' : 'Send XRP' }}
        </button>
      </div>

      <!-- Payment QR code -->
      <div v-if="paymentQrUrl" class="qr-section">
        <p>Approve this transaction in Xaman:</p>
        <img :src="paymentQrUrl" alt="Payment QR Code" class="qr-code" />
        <p class="hint">Or <a :href="paymentDeepLink" target="_blank">open in Xaman</a></p>
        <p class="waiting">Waiting for validation...</p>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Confirmation message -->
    <div v-if="txResult" class="confirmation">
      <h2>✅ Transaction Successful!</h2>
      <p><strong>Sent:</strong> {{ txResult.amount }} XRP</p>
      <p><strong>To:</strong> <code>{{ txResult.to }}</code></p>
      <p><strong>Tx Hash:</strong> <code>{{ txResult.hash }}</code></p>
      <a
        :href="`https://testnet.xrpl.org/transactions/${txResult.hash}`"
        target="_blank"
        class="explorer-link"
      >
        View on XRPL Explorer →
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const walletAddress = ref('')
const isConnecting = ref(false)
const qrUrl = ref('')
const deepLink = ref('')

const recipient = ref('')
const amount = ref<number | string>('')
const isSending = ref(false)
const paymentQrUrl = ref('')
const paymentDeepLink = ref('')

const errorMessage = ref('')
const txResult = ref<{ amount: string; to: string; hash: string } | null>(null)

// --- Connect wallet via Xaman sign-in ---
async function connectWallet() {
  isConnecting.value = true
  errorMessage.value = ''

  try {
    // 1. Create a sign-in payload via our server API
    const payload = await $fetch<{
      uuid: string
      qrUrl: string
      deepLink: string
    }>('/api/xaman/signin', { method: 'POST' })

    qrUrl.value = payload.qrUrl
    deepLink.value = payload.deepLink

    // 2. Poll for the sign-in result
    const result = await pollPayload(payload.uuid)

    if (result.signed && result.account) {
      walletAddress.value = result.account
      qrUrl.value = ''
      deepLink.value = ''
    } else {
      errorMessage.value = 'Sign-in was rejected or expired.'
      qrUrl.value = ''
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Failed to connect wallet.'
    console.error(err)
  } finally {
    isConnecting.value = false
  }
}

// --- Send XRP payment ---
async function sendXRP() {
  if (!recipient.value.trim() || !amount.value) return

  isSending.value = true
  errorMessage.value = ''
  txResult.value = null

  try {
    // 1. Create a payment payload
    const payload = await $fetch<{
      uuid: string
      qrUrl: string
      deepLink: string
    }>('/api/xaman/payment', {
      method: 'POST',
      body: {
        destination: recipient.value,
        amount: String(amount.value),
        account: walletAddress.value,
      },
    })

    paymentQrUrl.value = payload.qrUrl
    paymentDeepLink.value = payload.deepLink

    // 2. Poll for the payment result
    const result = await pollPayload(payload.uuid)

    if (result.signed && result.txHash) {
      txResult.value = {
        amount: String(amount.value),
        to: recipient.value,
        hash: result.txHash,
      }
      paymentQrUrl.value = ''
      paymentDeepLink.value = ''
    } else {
      errorMessage.value = 'Transaction was rejected.'
      paymentQrUrl.value = ''
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Failed to send payment.'
    console.error(err)
  } finally {
    isSending.value = false
  }
}

// --- Poll for payload status ---
async function pollPayload(uuid: string): Promise<{
  signed: boolean
  account?: string
  txHash?: string
}> {
  const maxAttempts = 60 // 2 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const status = await $fetch<{
      resolved: boolean
      signed: boolean
      account?: string
      txHash?: string
    }>(`/api/xaman/status?uuid=${uuid}`)

    if (status.resolved) {
      return status
    }
  }
  throw new Error('Payload timed out.')
}

function disconnect() {
  walletAddress.value = ''
  txResult.value = null
  recipient.value = ''
  amount.value = ''
  errorMessage.value = ''
}
</script>

<style scoped>
.wallet-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  background: #0f0f1a;
  color: #fff;
  min-height: 100vh;
}

.back-link { color: #3b82f6; text-decoration: none; }
h1 { margin: 1.5rem 0; }

.connect-section p, .wallet-info p { color: #ccc; }

.btn, .send-btn {
  display: block;
  width: 100%;
  margin-top: 1rem;
  padding: 14px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.btn:hover:not(:disabled), .send-btn:hover:not(:disabled) { background: #2563eb; }
.btn:disabled, .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.send-btn { background: #10b981; }
.send-btn:hover:not(:disabled) { background: #059669; }

.disconnect-btn {
  background: none;
  border: 1px solid #555;
  color: #aaa;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.wallet-info {
  background: #1a1a2e;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.wallet-info code {
  font-size: 0.8rem;
  word-break: break-all;
}

.form label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
  color: #ccc;
}

.form input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #1a1a2e;
  color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}

.qr-section {
  text-align: center;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #1a1a2e;
  border-radius: 10px;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin: 1rem auto;
  border-radius: 8px;
}

.hint { color: #888; font-size: 0.9rem; }
.hint a { color: #3b82f6; }
.waiting { color: #f59e0b; font-style: italic; margin-top: 0.5rem; }

.error { color: #ef4444; margin-top: 1rem; }

.confirmation {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #1a2e1a;
  border: 1px solid #10b981;
  border-radius: 10px;
  text-align: center;
}

.confirmation code {
  font-size: 0.8rem;
  word-break: break-all;
}

.explorer-link {
  display: inline-block;
  margin-top: 1rem;
  color: #3b82f6;
  font-weight: bold;
  text-decoration: none;
}
.explorer-link:hover { text-decoration: underline; }
</style>
