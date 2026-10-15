<script setup lang="ts">
import { computed, ref } from 'vue'

import { useTwitchChat } from '@/composables/useTwitchChat'
import { useSettings } from '@/stores/settings'
import type { ChatConnectionStatus } from '@/types/chat'

const { status, statusDetail, error, isConnected, connect, disconnect } = useTwitchChat()
const settings = useSettings()

const channelInput = ref(settings.channel)

const STATUS_LABELS: Record<ChatConnectionStatus, string> = {
  disconnected: 'Desconectado',
  connecting: 'Conectando…',
  connected: 'Conectado',
  reconnecting: 'Reconectando…',
  error: 'Error',
}

const statusLabel = computed(() => STATUS_LABELS[status.value])
const busy = computed(() => status.value === 'connecting' || status.value === 'reconnecting')

async function handleConnect(): Promise<void> {
  settings.channel = channelInput.value.trim().replace(/^#/, '').toLowerCase()
  await connect(channelInput.value)
}

function handleDisconnect(): void {
  disconnect()
}
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <h2 class="panel__title">Canal de Twitch</h2>
      <span class="status" :class="`status--${status}`">
        <span class="status__dot" />
        {{ statusLabel }}
      </span>
    </header>

    <form class="connection" @submit.prevent="handleConnect">
      <input
        v-model="channelInput"
        type="text"
        placeholder="Nombre del canal (ej. elmatty7u7)"
        aria-label="Nombre del canal de Twitch"
        :disabled="isConnected || busy"
        autocomplete="off"
        spellcheck="false"
      />
      <button v-if="!isConnected" type="submit" class="button" :disabled="busy">
        {{ busy ? 'Conectando…' : 'Conectar' }}
      </button>
      <button v-else type="button" class="button button--danger" @click="handleDisconnect">
        Desconectar
      </button>
    </form>

    <p v-if="statusDetail" class="hint">{{ statusDetail }}</p>
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="isConnected" class="hint">
      Leyendo el chat de <strong>#{{ settings.channel }}</strong> en modo anónimo (solo lectura).
    </p>
  </section>
</template>

<style scoped>
.connection {
  display: flex;
  gap: 0.6rem;
}

.connection input {
  flex: 1;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-faint);
}

.status--connected {
  color: var(--success);
}
.status--connected .status__dot {
  background: var(--success);
  box-shadow: 0 0 10px var(--success);
}
.status--connecting .status__dot,
.status--reconnecting .status__dot {
  background: var(--warning);
}
.status--error {
  color: #ff7b78;
}
.status--error .status__dot {
  background: var(--danger);
}

.hint {
  margin-top: 0.75rem;
}
</style>
