<script setup>
import { ref, onMounted } from 'vue'

const health = ref(null)
const healthError = ref('')
const items = ref([])
const newName = ref('')
const formError = ref('')

// Empty locally (Vite proxies /api); set to the Vercel backend in .env.production.
const API_BASE = import.meta.env.VITE_API_URL || ''

async function api(path, options = {}) {
  const res = await fetch(API_BASE + '/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

async function load() {
  try {
    health.value = await api('/health')
    healthError.value = ''
    items.value = await api('/items')
  } catch (e) {
    health.value = null
    healthError.value = 'The API is not responding. Check that Fastify is running on port 3000.'
  }
}

async function addItem() {
  if (!newName.value.trim()) {
    formError.value = 'Enter a step name first.'
    return
  }
  try {
    const item = await api('/items', {
      method: 'POST',
      body: JSON.stringify({ name: newName.value })
    })
    items.value.push(item)
    newName.value = ''
    formError.value = ''
  } catch (e) {
    formError.value = e.message
  }
}

async function toggle(item) {
  const updated = await api('/items/' + item.id, { method: 'PATCH' })
  item.done = updated.done
}

onMounted(load)
</script>

<template>
  <main class="page">
    <header class="head">
      <h1>Deployment checklist</h1>
      <p v-if="health" class="status ok">
        API connected. Node {{ health.node }}, up {{ health.uptimeSeconds }}s.
      </p>
      <p v-else-if="healthError" class="status bad">{{ healthError }}</p>
      <p v-else class="status">Checking the API…</p>
    </header>

    <ul class="list">
      <li v-for="item in items" :key="item.id">
        <label>
          <input type="checkbox" :checked="item.done" @change="toggle(item)" />
          <span :class="{ done: item.done }">{{ item.name }}</span>
        </label>
      </li>
    </ul>

    <div class="add">
      <input
        v-model="newName"
        placeholder="Add a step"
        aria-label="New step name"
        @input="formError = ''"
        @keyup.enter="addItem"
      />
      <button @click="addItem">Add step</button>
    </div>
    <p v-if="formError" class="error">{{ formError }}</p>
  </main>
</template>
