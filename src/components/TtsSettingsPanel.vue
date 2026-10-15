<script setup lang="ts">
import { computed } from 'vue'

import { useTts } from '@/composables/useTts'
import { useSettings } from '@/stores/settings'

const { voices, speaking, supported, speak } = useTts()
const settings = useSettings()

const selectedVoiceId = computed({
  get: () => {
    const id = settings.tts.voiceURI
    if (!id) return ''
    return voices.value.some((voice) => voice.id === id) ? id : ''
  },
  set: (value: string) => {
    settings.tts.voiceURI = value || null
  },
})

const languages = computed(() =>
  [...new Set(voices.value.map((voice) => voice.lang))].sort((a, b) => a.localeCompare(b)),
)

function handleVoiceChange(): void {
  const voice = voices.value.find((item) => item.id === selectedVoiceId.value)
  if (voice) settings.tts.lang = voice.lang
}

async function testVoice(): Promise<void> {
  await speak('Hola, esta es una prueba de Twitch TTS.')
}
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <h2 class="panel__title">Text-to-Speech</h2>
      <button
        type="button"
        class="button button--ghost"
        :disabled="speaking || !supported"
        @click="testVoice"
      >
        Probar voz
      </button>
    </header>

    <p v-if="!supported" class="error-text">
      Tu navegador no soporta la Web Speech API. Prueba con Chrome, Edge o Safari recientes.
    </p>

    <div class="field">
      <label class="field__label" for="tts-voice">Voz</label>
      <select id="tts-voice" v-model="selectedVoiceId" @change="handleVoiceChange">
        <option value="">Automática (la del sistema)</option>
        <option v-for="voice in voices" :key="voice.id" :value="voice.id">
          {{ voice.name }} — {{ voice.lang }}{{ voice.localService ? '' : ' (online)' }}
        </option>
      </select>
      <p v-if="voices.length === 0" class="hint">
        No se han detectado voces todavía. Algunos navegadores las cargan de forma asíncrona.
      </p>
    </div>

    <div class="field">
      <label class="field__label" for="tts-lang">Idioma</label>
      <select id="tts-lang" v-model="settings.tts.lang">
        <option value="">El de la voz</option>
        <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
      </select>
    </div>

    <div class="field">
      <label class="field__label" for="tts-volume">
        Volumen <span class="field__value">{{ Math.round(settings.tts.volume * 100) }}%</span>
      </label>
      <input
        id="tts-volume"
        v-model.number="settings.tts.volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
      />
    </div>

    <div class="field">
      <label class="field__label" for="tts-rate">
        Velocidad <span class="field__value">{{ settings.tts.rate.toFixed(2) }}×</span>
      </label>
      <input
        id="tts-rate"
        v-model.number="settings.tts.rate"
        type="range"
        min="0.5"
        max="2"
        step="0.05"
      />
    </div>

    <div class="field">
      <label class="field__label" for="tts-pitch">
        Tono <span class="field__value">{{ settings.tts.pitch.toFixed(2) }}</span>
      </label>
      <input
        id="tts-pitch"
        v-model.number="settings.tts.pitch"
        type="range"
        min="0"
        max="2"
        step="0.05"
      />
    </div>

    <label class="checkbox">
      <input v-model="settings.tts.readUsername" type="checkbox" />
      Leer el nombre del usuario
    </label>

    <div v-if="settings.tts.readUsername" class="field">
      <label class="field__label" for="tts-template">
        Plantilla <span class="hint">usa {user} y {message}</span>
      </label>
      <input
        id="tts-template"
        v-model="settings.tts.usernameTemplate"
        type="text"
        placeholder="{user} dice: {message}"
      />
    </div>
  </section>
</template>
