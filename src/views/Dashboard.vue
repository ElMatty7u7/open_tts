<script setup lang="ts">
import { onMounted } from 'vue'

import ChatFeed from '@/components/ChatFeed.vue'
import ConnectionPanel from '@/components/ConnectionPanel.vue'
import FilterSettingsPanel from '@/components/FilterSettingsPanel.vue'
import QueuePanel from '@/components/QueuePanel.vue'
import TtsSettingsPanel from '@/components/TtsSettingsPanel.vue'
import { useTtsPipeline } from '@/composables/useTtsPipeline'

const pipeline = useTtsPipeline()

onMounted(() => {
  pipeline.start()
})
</script>

<template>
  <main class="dashboard">
    <header class="dashboard__header">
      <div>
        <h1 class="dashboard__title">Twitch TTS</h1>
        <p class="dashboard__subtitle">
          Lee en voz alta los mensajes del chat. Pensado para directos en OBS.
        </p>
      </div>
      <RouterLink class="button button--ghost" to="/overlay">Abrir overlay</RouterLink>
    </header>

    <div class="dashboard__grid">
      <div class="dashboard__column">
        <ConnectionPanel />
        <TtsSettingsPanel />
        <FilterSettingsPanel />
      </div>
      <div class="dashboard__column">
        <QueuePanel />
        <ChatFeed />
      </div>
    </div>

    <footer class="dashboard__footer">
      <span> Lee el chat de forma anónima (solo lectura, sin OAuth). No afiliado a Twitch. </span>
    </footer>
  </main>
</template>

<style scoped>
.dashboard {
  max-width: 1180px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.dashboard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.6rem;
}

.dashboard__title {
  font-size: 1.8rem;
}

.dashboard__subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
}

.dashboard__grid {
  display: grid;
  grid-template-columns: minmax(320px, 420px) 1fr;
  gap: 1.25rem;
  align-items: start;
}

.dashboard__column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dashboard__footer {
  margin-top: 2rem;
  color: var(--text-faint);
  font-size: 0.82rem;
  text-align: center;
}

@media (max-width: 900px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}
</style>
