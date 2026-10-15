import type { ChatMessage } from '@/types/chat'

export const OVERLAY_CHANNEL_NAME = 'twitch-tts:overlay'

/** Estado que el dashboard envía al overlay (Browser Source de OBS). */
export interface OverlaySnapshot {
  connected: boolean
  channel: string
  speaking: boolean
  nowPlaying: string | null
  queue: string[]
  messages: ChatMessage[]
}

export type OverlayEvent = { type: 'state'; payload: OverlaySnapshot }

/**
 * Crea un canal de mensajería entre la pestaña principal y el overlay.
 *
 * Nota: `BroadcastChannel` solo funciona entre pestañas del mismo navegador y
 * origen. Cuando el overlay se abra como Browser Source de OBS (otro proceso),
 * hará falta un transporte distinto (WebSocket o servidor local). De momento
 * sirve para previsualizar el overlay en una pestaña.
 */
export function getOverlayChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  return new BroadcastChannel(OVERLAY_CHANNEL_NAME)
}
