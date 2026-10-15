import { Emitter } from '@/lib/emitter'
import type { ChatConnectionStatus, ChatMessage, ChatPlatform } from '@/types/chat'

/** Eventos que emite cualquier proveedor de chat. */
export type ChatProviderEvents = {
  message: ChatMessage
  status: { status: ChatConnectionStatus; detail?: string }
  error: { error: Error; fatal: boolean }
}

/**
 * Contrato que debe cumplir todo proveedor de chat (Twitch, YouTube, Kick…).
 *
 * La aplicación solo conoce esta interfaz, nunca una implementación concreta.
 */
export abstract class ChatProvider extends Emitter<ChatProviderEvents> {
  abstract readonly platform: ChatPlatform

  /** Se conecta al chat del canal indicado. Acepta `#canal` o `canal`. */
  abstract connect(channel: string): Promise<void>

  /** Cierra la conexión y detiene cualquier reconexión automática. */
  abstract disconnect(): void
}
