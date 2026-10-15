import { ref, shallowRef } from 'vue'

import { WebSpeechTtsProvider } from '@/services/tts/WebSpeechTtsProvider'
import type { TtsProvider, TtsVoice } from '@/services/tts/types'
import { useSettings } from '@/stores/settings'

const provider: TtsProvider = new WebSpeechTtsProvider()

const voices = shallowRef<TtsVoice[]>([])
const supported = ref(provider.isSupported())
const speaking = ref(false)
const activeText = ref<string | null>(null)

let ready = false

function ensureReady(): void {
  if (ready) return
  ready = true
  voices.value = provider.getVoices()
  provider.onVoicesChanged(() => {
    voices.value = provider.getVoices()
  })
}

/**
 * Envuelve el motor TTS activo y ofrece una API estable al resto de la app.
 *
 * Cualquier componente que llame a `useTts()` comparte el mismo motor y estado.
 */
export function useTts() {
  ensureReady()
  const settings = useSettings()

  async function speak(text: string): Promise<void> {
    if (!supported.value) return
    activeText.value = text
    speaking.value = true
    try {
      await provider.speak(text, {
        voiceId: settings.tts.voiceURI,
        lang: settings.tts.lang || undefined,
        volume: settings.tts.volume,
        rate: settings.tts.rate,
        pitch: settings.tts.pitch,
      })
    } finally {
      speaking.value = false
      activeText.value = null
    }
  }

  return {
    providerName: provider.name,
    voices,
    supported,
    speaking,
    activeText,
    speak,
    pause: () => provider.pause(),
    resume: () => provider.resume(),
    cancel: () => provider.cancel(),
  }
}
