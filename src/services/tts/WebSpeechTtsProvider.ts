import type { TtsProvider, TtsSpeakOptions, TtsVoice } from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Motor TTS basado en la Web Speech API del navegador
 * (`window.speechSynthesis` + `SpeechSynthesisUtterance`).
 */
export class WebSpeechTtsProvider implements TtsProvider {
  readonly name = 'Web Speech API'

  private current: SpeechSynthesisUtterance | null = null
  private readonly voicesListeners = new Set<() => void>()
  private voicesBound = false

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    )
  }

  getVoices(): TtsVoice[] {
    if (!this.isSupported()) return []
    return window.speechSynthesis.getVoices().map((voice) => ({
      id: voice.voiceURI,
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      isDefault: voice.default,
    }))
  }

  onVoicesChanged(listener: () => void): () => void {
    this.bindVoicesEvent()
    this.voicesListeners.add(listener)
    return () => {
      this.voicesListeners.delete(listener)
    }
  }

  speak(text: string, options: TtsSpeakOptions): Promise<void> {
    if (!this.isSupported()) {
      return Promise.reject(new Error('La Web Speech API no está disponible en este navegador.'))
    }

    const cleanText = text.trim()
    if (!cleanText) return Promise.resolve()

    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleanText)

      const voice = options.voiceId
        ? (window.speechSynthesis.getVoices().find((v) => v.voiceURI === options.voiceId) ?? null)
        : null
      if (voice) utterance.voice = voice
      if (options.lang) utterance.lang = options.lang
      utterance.volume = clamp(options.volume ?? 1, 0, 1)
      utterance.rate = clamp(options.rate ?? 1, 0.1, 10)
      utterance.pitch = clamp(options.pitch ?? 1, 0, 2)

      const finish = (): void => {
        if (this.current === utterance) this.current = null
        resolve()
      }
      utterance.onend = finish
      utterance.onerror = finish

      this.current = utterance
      window.speechSynthesis.speak(utterance)
    })
  }

  pause(): void {
    if (this.isSupported()) window.speechSynthesis.pause()
  }

  resume(): void {
    if (this.isSupported()) window.speechSynthesis.resume()
  }

  cancel(): void {
    if (!this.isSupported()) return
    this.current = null
    window.speechSynthesis.cancel()
  }

  private bindVoicesEvent(): void {
    if (this.voicesBound || !this.isSupported()) return
    this.voicesBound = true
    window.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged)
  }

  private readonly handleVoicesChanged = (): void => {
    this.voicesListeners.forEach((listener) => listener())
  }
}
