import { reactive, watch } from 'vue'

import type { AppSettings } from '@/types/settings'

const STORAGE_KEY = 'twitch-tts:settings:v1'

export const DEFAULT_SETTINGS: AppSettings = {
  channel: '',
  tts: {
    voiceURI: null,
    lang: '',
    volume: 1,
    rate: 1,
    pitch: 1,
    readUsername: true,
    usernameTemplate: '{user} dice: {message}',
  },
  filters: {
    ignoreCommands: true,
    ignoreUrls: true,
    maxLength: 200,
    ignoredUsers: [],
    cooldownSeconds: 0,
  },
}

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Mezcla profunda que respeta los valores por defecto ante esquemas antiguos. */
function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(stored) ? stored : defaults) as T
  }
  if (isPlainObject(defaults)) {
    const source = isPlainObject(stored) ? stored : {}
    const result: PlainObject = {}
    for (const key of Object.keys(defaults)) {
      result[key] = mergeDefaults((defaults as PlainObject)[key], source[key])
    }
    return result as T
  }
  return (stored === undefined ? defaults : stored) as T
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_SETTINGS)
    return mergeDefaults(DEFAULT_SETTINGS, JSON.parse(raw))
  } catch {
    return structuredClone(DEFAULT_SETTINGS)
  }
}

/**
 * Estado global de configuración.
 *
 * Se implementa como un singleton reactivo con persistencia en `localStorage`.
 * Para el tamaño de la V0.1 no aporta valor añadir Pinia; si el estado crece
 * (múltiples proveedores, sesiones…) se puede migrar sin cambiar la API pública
 * de `useSettings`.
 */
const settings = reactive<AppSettings>(loadSettings())

watch(
  settings,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Sin persistencia (modo privado, cuota llena…), la app sigue funcionando.
    }
  },
  { deep: true },
)

export function useSettings(): AppSettings {
  return settings
}

/** Restaura los valores por defecto. */
export function resetSettings(): void {
  Object.assign(settings, structuredClone(DEFAULT_SETTINGS))
}
