<script setup lang="ts">
import { useMessageQueue } from '@/composables/useMessageQueue'

const { items, size, paused, nowPlaying, skipped, clear, pause, resume, remove } = useMessageQueue()
</script>

<template>
  <section class="panel queue">
    <header class="panel__header">
      <h2 class="panel__title">Cola de TTS ({{ size }})</h2>
      <div class="queue__actions">
        <button
          v-if="!paused"
          type="button"
          class="button button--ghost"
          :disabled="size === 0 && !nowPlaying"
          @click="pause"
        >
          Pausar TTS
        </button>
        <button v-else type="button" class="button" @click="resume">Reanudar TTS</button>
        <button
          type="button"
          class="button button--danger"
          :disabled="size === 0 && !nowPlaying"
          @click="clear"
        >
          Vaciar cola
        </button>
      </div>
    </header>

    <div v-if="nowPlaying" class="now-playing">
      <span class="now-playing__label">Reproduciendo</span>
      <p class="now-playing__text">{{ nowPlaying.spokenText }}</p>
    </div>

    <ol v-if="items.length" class="queue__list">
      <li v-for="(entry, index) in items" :key="entry.id" class="queue__item">
        <span class="queue__index">{{ index + 1 }}</span>
        <span class="queue__user">{{ entry.payload.message.displayName }}:</span>
        <span class="queue__text">{{ entry.payload.text }}</span>
        <button
          type="button"
          class="queue__remove"
          title="Quitar de la cola"
          @click="remove(entry.id)"
        >
          ×
        </button>
      </li>
    </ol>
    <p v-else class="empty">La cola está vacía.</p>

    <p v-if="skipped > 0" class="hint">{{ skipped }} mensaje(s) descartados por los filtros.</p>
  </section>
</template>

<style scoped>
.queue__actions {
  display: flex;
  gap: 0.5rem;
}

.now-playing {
  background: var(--accent-soft);
  border: 1px solid rgba(145, 71, 255, 0.35);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.9rem;
}

.now-playing__label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  font-weight: 700;
}

.now-playing__text {
  margin: 0.2rem 0 0;
}

.queue__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 340px;
  overflow-y: auto;
}

.queue__item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
}

.queue__index {
  color: var(--text-faint);
  font-size: 0.78rem;
  min-width: 1.2rem;
}

.queue__user {
  font-weight: 600;
  white-space: nowrap;
}

.queue__text {
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.queue__remove {
  border: none;
  background: transparent;
  color: var(--text-faint);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0.2rem;
}

.queue__remove:hover {
  color: #ff7b78;
}

.empty {
  color: var(--text-faint);
  margin: 0;
}
</style>
