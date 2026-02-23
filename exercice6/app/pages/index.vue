<template>
  <div class="home">
    <h1>🎨 NISAR Clock NFT Studio</h1>
    <p>Select a clock, customize its colors, and mint it as an NFT via Xaman wallet.</p>
    <NuxtLink to="/create" class="btn">Create NFT</NuxtLink>
  </div>
</template>

<style scoped>
.home {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 100vh; text-align: center;
  font-family: Arial, sans-serif; background: #0f0f1a; color: #fff;
}
h1 { font-size: 2.5rem; margin-bottom: 1rem; }
p { font-size: 1.1rem; color: #aaa; margin-bottom: 2rem; max-width: 500px; }
.btn {
  display: inline-block; padding: 14px 40px; background: #8b5cf6;
  color: #fff; text-decoration: none; border-radius: 8px;
  font-size: 1.1rem; font-weight: bold; transition: background 0.2s;
}
.btn:hover { background: #7c3aed; }
</style>
