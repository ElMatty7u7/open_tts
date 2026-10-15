import type { TtsProvider } from './types'
import { WebSpeechTtsProvider } from './WebSpeechTtsProvider'

export type TtsProviderFactory = () => TtsProvider

/**
 * Registro de motores TTS disponibles.
 *
 * Para añadir ElevenLabs, Google TTS, etc., implementa `TtsProvider` y
 * regístralo aquí.
 */
const providers: Record<string, TtsProviderFactory> = {
  webSpeech: () => new WebSpeechTtsProvider(),
  // elevenlabs: () => new ElevenLabsTtsProvider(), // pendiente
}

export function createTtsProvider(id: string): TtsProvider {
  const factory = providers[id]
  if (!factory) {
    throw new Error(`El motor TTS "${id}" no está registrado.`)
  }
  return factory()
}

export { WebSpeechTtsProvider }
export type { TtsProvider, TtsSpeakOptions, TtsVoice } from './types'
