/** Voz disponible en el sistema. */
export interface TtsVoice {
  /** Identificador estable de la voz (normalmente su `voiceURI`). */
  id: string
  name: string
  /** Idioma BCP-47, ej. `es-MX`. */
  lang: string
  /** `true` si la voz funciona sin conexión. */
  localService: boolean
  isDefault: boolean
}

/** Opciones para una locución concreta. */
export interface TtsSpeakOptions {
  voiceId?: string | null
  lang?: string
  volume?: number
  rate?: number
  pitch?: number
}

/**
 * Contrato que debe cumplir todo motor TTS (Web Speech API, ElevenLabs, Google…).
 *
 * La cola de mensajes solo conoce esta interfaz.
 */
export interface TtsProvider {
  readonly name: string

  /** Indica si el motor está disponible en el entorno actual. */
  isSupported(): boolean

  /** Voces disponibles en el sistema. */
  getVoices(): TtsVoice[]

  /** Se suscribe a los cambios en la lista de voces. Devuelve un cancelador. */
  onVoicesChanged(listener: () => void): () => void

  /**
   * Reproduce un texto. La promesa se resuelve cuando termina la locución
   * (o se cancela), para poder encadenar mensajes sin solaparlos.
   */
  speak(text: string, options: TtsSpeakOptions): Promise<void>

  pause(): void
  resume(): void
  cancel(): void
}
