import { watch } from 'vue'

import { getOverlayChannel } from '@/services/overlay'
import type { OverlayEvent, OverlaySnapshot } from '@/services/overlay'

import { useMessageQueue } from './useMessageQueue'
import { useTts } from './useTts'
import { useTwitchChat } from './useTwitchChat'

let started = false

/**
 * Une el flujo completo: chat -> filtros/cooldown -> cola -> TTS.
 *
 * Se arranca una sola vez (desde el dashboard). El overlay no ejecuta este
 * pipeline para evitar conexiones y audios duplicados.
 */
export function useTtsPipeline() {
  const chat = useTwitchChat()
  const queue = useMessageQueue()
  const tts = useTts()

  function start(): void {
    if (started) return
    started = true

    chat.onMessage((message) => {
      queue.enqueueMessage(message)
    })

    startOverlayPublisher()
  }

  function startOverlayPublisher(): void {
    const channel = getOverlayChannel()
    if (!channel) return

    watch(
      [chat.recentMessages, queue.items, queue.nowPlaying, tts.speaking, chat.status, chat.channel],
      () => {
        const snapshot: OverlaySnapshot = {
          connected: chat.status.value === 'connected',
          channel: chat.channel.value,
          speaking: tts.speaking.value,
          nowPlaying: queue.nowPlaying.value?.spokenText ?? null,
          queue: queue.items.value.map((entry) => entry.payload.spokenText),
          messages: chat.recentMessages.value.slice(-20),
        }
        const event: OverlayEvent = { type: 'state', payload: snapshot }
        channel.postMessage(event)
      },
      { immediate: true },
    )
  }

  return { start }
}
