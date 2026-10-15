<script setup lang="ts">
import { useTwitchChat } from '@/composables/useTwitchChat'

const { recentMessages } = useTwitchChat()

const timeFormatter = new Intl.DateTimeFormat('es', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function formatTime(timestamp: number): string {
  return timeFormatter.format(timestamp)
}
</script>

<template>
  <section class="panel chat">
    <header class="panel__header">
      <h2 class="panel__title">Chat en vivo</h2>
    </header>

    <ul v-if="recentMessages.length" class="chat__list">
      <li v-for="message in recentMessages" :key="message.id" class="chat__item">
        <span class="chat__time">{{ formatTime(message.timestamp) }}</span>
        <span class="chat__user" :style="{ color: message.color || undefined }">
          {{ message.displayName }}
        </span>
        <span class="chat__badges">
          <span v-if="message.isBroadcaster" class="chat__badge">streamer</span>
          <span v-if="message.isMod" class="chat__badge">mod</span>
          <span v-if="message.isVip" class="chat__badge">vip</span>
          <span v-if="message.isSubscriber" class="chat__badge">sub</span>
        </span>
        <span class="chat__text">{{ message.text }}</span>
      </li>
    </ul>
    <p v-else class="empty">Sin mensajes todavía.</p>
  </section>
</template>

<style scoped>
.chat__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: 420px;
  overflow-y: auto;
  font-size: 0.9rem;
}

.chat__item {
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
}

.chat__item:hover {
  background: var(--bg-elevated);
}

.chat__time {
  color: var(--text-faint);
  font-size: 0.75rem;
  margin-right: 0.5rem;
  font-variant-numeric: tabular-nums;
}

.chat__user {
  font-weight: 600;
}

.chat__text {
  color: var(--text-muted);
  margin-left: 0.4rem;
}

.chat__badges {
  display: inline-flex;
  gap: 0.25rem;
  margin-left: 0.4rem;
}

.chat__badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text-faint);
}

.empty {
  color: var(--text-faint);
  margin: 0;
}
</style>
