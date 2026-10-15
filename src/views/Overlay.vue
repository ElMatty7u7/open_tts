<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { getOverlayChannel } from '@/services/overlay'
import type { OverlayEvent, OverlaySnapshot } from '@/services/overlay'

const snapshot = ref<OverlaySnapshot | null>(null)
let channel: BroadcastChannel | null = null

onMounted(() => {
  channel = getOverlayChannel()
  if (!channel) return
  channel.addEventListener('message', (event: MessageEvent<OverlayEvent>) => {
    if (event.data?.type === 'state') {
      snapshot.value = event.data.payload
    }
  })
})

onBeforeUnmount(() => {
  channel?.close()
  channel = null
})
</script>

<template>
  <div class="overlay">
    <div v-if="!snapshot" class="overlay__waiting">
      <h1>Twitch TTS — Overlay</h1>
      <p>
        Abre el dashboard en otra pestaña y conecta un canal. Este overlay escucha el estado por
        <code>BroadcastChannel</code> y debe ejecutarse en el mismo navegador.
      </p>
      <p class="hint">
        Para usarlo como Browser Source de OBS hará falta un transporte compartido (WebSocket),
        previsto para una versión futura.
      </p>
    </div>

    <div v-else class="overlay__content">
      <div class="overlay__status">
        <span class="dot" :class="{ 'dot--on': snapshot.connected }" />
        <span>{{ snapshot.connected ? `#${snapshot.channel}` : 'Desconectado' }}</span>
      </div>

      <transition name="fade" mode="out-in">
        <p v-if="snapshot.nowPlaying" :key="snapshot.nowPlaying" class="overlay__now">
          {{ snapshot.nowPlaying }}
        </p>
      </transition>

      <ul v-if="snapshot.queue.length" class="overlay__queue">
        <li v-for="(item, index) in snapshot.queue.slice(0, 5)" :key="`${index}-${item}`">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  min-height: 100vh;
  background: transparent;
  padding: 1.5rem;
  font-size: 1.1rem;
}

.overlay__waiting {
  max-width: 520px;
  margin: 10vh auto 0;
  text-align: center;
  color: var(--text-muted);
  background: rgba(14, 14, 16, 0.85);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.overlay__content {
  max-width: 640px;
}

.overlay__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(14, 14, 16, 0.8);
  font-weight: 600;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--text-faint);
}

.dot--on {
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}

.overlay__now {
  margin: 1rem 0 0;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  background: rgba(145, 71, 255, 0.85);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.overlay__queue {
  margin: 1rem 0 0;
  padding-left: 1.2rem;
  color: var(--text-muted);
}

code {
  background: var(--bg-elevated);
  border-radius: 4px;
  padding: 0 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
