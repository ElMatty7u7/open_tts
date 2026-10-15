import { computed, ref, shallowRef } from 'vue'

import { UserCooldown } from '@/services/cooldown'
import { evaluateMessage } from '@/services/filters'
import { MessageQueue } from '@/services/queue/MessageQueue'
import type { QueueEntry } from '@/services/queue/MessageQueue'
import { buildSpokenText } from '@/services/tts/speechText'
import type { ChatMessage } from '@/types/chat'

import { useSettings } from '@/stores/settings'
import { useTts } from './useTts'

/** Elemento de la cola, ya listo para leerse. */
export interface QueueItem {
  message: ChatMessage
  /** Texto filtrado (sin recortar según preferencias). */
  text: string
  /** Texto final que se envía al TTS. */
  spokenText: string
  enqueuedAt: number
}

const queue = new MessageQueue<QueueItem>()
const cooldown = new UserCooldown()

const items = shallowRef<readonly QueueEntry<QueueItem>[]>([])
const paused = ref(false)
const nowPlaying = ref<QueueItem | null>(null)
const skipped = ref(0)

let loopRunning = false

queue.subscribe((entries) => {
  // Copiamos para que la reactividad detecte el cambio (la cola muta en sitio).
  items.value = [...entries]
})

/**
 * Cola de TTS: decide qué mensajes se leen (filtros + cooldown) y los reproduce
 * uno a uno sin solapamientos, controlando pausa y vaciado.
 */
export function useMessageQueue() {
  const settings = useSettings()
  const tts = useTts()

  const size = computed(() => items.value.length)
  const isSpeakingNow = computed(() => tts.speaking.value || nowPlaying.value !== null)

  /** Aplica filtros/cooldown y encola si procede. Devuelve si se encoló. */
  function enqueueMessage(message: ChatMessage): boolean {
    const decision = evaluateMessage(message, settings.filters)
    if (!decision.allowed) {
      skipped.value += 1
      return false
    }

    cooldown.setCooldown(settings.filters.cooldownSeconds * 1000)
    if (cooldown.isOnCooldown(message.username)) {
      skipped.value += 1
      return false
    }
    cooldown.markSpoken(message.username)

    queue.enqueue({
      message,
      text: decision.text,
      spokenText: buildSpokenText(message, settings.tts),
      enqueuedAt: Date.now(),
    })

    void runLoop()
    return true
  }

  async function runLoop(): Promise<void> {
    if (loopRunning) return
    loopRunning = true
    try {
      while (!paused.value) {
        const entry = queue.dequeue()
        if (!entry) break
        nowPlaying.value = entry.payload
        await tts.speak(entry.payload.spokenText)
        nowPlaying.value = null
      }
    } finally {
      loopRunning = false
    }
  }

  /** Pausa la lectura actual y detiene el avance de la cola. */
  function pause(): void {
    if (paused.value) return
    paused.value = true
    tts.pause()
  }

  /** Reanuda la lectura y continúa vaciando la cola. */
  function resume(): void {
    if (!paused.value) return
    paused.value = false
    tts.resume()
    void runLoop()
  }

  /** Vacía la cola y corta la locución actual. */
  function clear(): void {
    queue.clear()
    tts.cancel()
    nowPlaying.value = null
  }

  /** Elimina un mensaje concreto de la cola. */
  function remove(id: string): void {
    queue.remove(id)
  }

  return {
    items,
    size,
    paused,
    nowPlaying,
    isSpeakingNow,
    skipped,
    enqueueMessage,
    remove,
    clear,
    pause,
    resume,
  }
}
