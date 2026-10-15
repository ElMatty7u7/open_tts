import { computed, ref, shallowRef } from 'vue'

import { createChatProvider } from '@/services/chat'
import type { ChatProvider } from '@/services/chat/ChatProvider'
import type { ChatConnectionStatus, ChatMessage } from '@/types/chat'

const MAX_RECENT_MESSAGES = 150

const status = ref<ChatConnectionStatus>('disconnected')
const statusDetail = ref('')
const channel = ref('')
const error = ref<string | null>(null)
const recentMessages = shallowRef<ChatMessage[]>([])
const messageHandlers = new Set<(message: ChatMessage) => void>()

let provider: ChatProvider | null = null
let unsubscribers: Array<() => void> = []

function handleMessage(message: ChatMessage): void {
  const next = [...recentMessages.value, message]
  if (next.length > MAX_RECENT_MESSAGES) next.splice(0, next.length - MAX_RECENT_MESSAGES)
  recentMessages.value = next
  messageHandlers.forEach((handler) => handler(message))
}

/**
 * Conexión con el chat. Expone estado reactivo y un `onMessage` para que otros
 * módulos (la cola de TTS) reaccionen a los mensajes entrantes.
 */
export function useTwitchChat() {
  const isConnected = computed(() => status.value === 'connected')

  async function connect(targetChannel: string): Promise<void> {
    disconnect()

    const normalized = targetChannel.trim().replace(/^#/, '').toLowerCase()
    if (!normalized) {
      error.value = 'Escribe el nombre de un canal.'
      return
    }

    error.value = null
    channel.value = normalized
    recentMessages.value = []

    provider = createChatProvider('twitch')
    unsubscribers = [
      provider.on('message', handleMessage),
      provider.on('status', ({ status: nextStatus, detail }) => {
        status.value = nextStatus
        statusDetail.value = detail ?? ''
      }),
      provider.on('error', ({ error: providerError, fatal }) => {
        error.value = providerError.message
        if (fatal) status.value = 'error'
      }),
    ]

    try {
      await provider.connect(normalized)
    } catch (cause) {
      status.value = 'error'
      error.value = cause instanceof Error ? cause.message : 'No se pudo conectar al chat.'
    }
  }

  function disconnect(): void {
    unsubscribers.forEach((unsubscribe) => unsubscribe())
    unsubscribers = []
    provider?.disconnect()
    provider = null
    status.value = 'disconnected'
    statusDetail.value = ''
  }

  function onMessage(handler: (message: ChatMessage) => void): () => void {
    messageHandlers.add(handler)
    return () => {
      messageHandlers.delete(handler)
    }
  }

  return {
    status,
    statusDetail,
    channel,
    error,
    recentMessages,
    isConnected,
    connect,
    disconnect,
    onMessage,
  }
}
