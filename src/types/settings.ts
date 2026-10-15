/** Configuración del motor de Text-to-Speech. */
export interface TtsSettings {
  /** `voiceURI` de la voz seleccionada, o `null` para usar la voz por defecto. */
  voiceURI: string | null
  /** Idioma BCP-47 (ej. `es-MX`). Vacío significa "el de la voz". */
  lang: string
  /** Volumen entre 0 y 1. */
  volume: number
  /** Velocidad. 1 es normal. */
  rate: number
  /** Tono. 1 es normal. */
  pitch: number
  /** Si es `true`, se lee el nombre del usuario antes del mensaje. */
  readUsername: boolean
  /** Plantilla usada al leer el nombre. Admite `{user}` y `{message}`. */
  usernameTemplate: string
}

/** Filtros aplicados antes de enviar un mensaje a la cola de TTS. */
export interface FilterSettings {
  /** Ignorar mensajes que empiezan por `!`. */
  ignoreCommands: boolean
  /** Ignorar mensajes que contienen URLs. */
  ignoreUrls: boolean
  /** Longitud máxima del mensaje (0 = sin límite). */
  maxLength: number
  /** Usuarios (login) cuyos mensajes nunca se leen. */
  ignoredUsers: string[]
  /** Segundos mínimos entre mensajes de un mismo usuario (0 = desactivado). */
  cooldownSeconds: number
}

/** Preferencias persistentes de la aplicación. */
export interface AppSettings {
  /** Último canal usado. */
  channel: string
  tts: TtsSettings
  filters: FilterSettings
}
