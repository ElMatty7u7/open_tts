/** Plataformas de chat soportadas (o previstas) por la aplicación. */
export type ChatPlatform = 'twitch' | 'youtube' | 'kick'

/** Estado de la conexión con el proveedor de chat. */
export type ChatConnectionStatus =
  'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

/**
 * Mensaje de chat normalizado e independiente de la plataforma.
 *
 * Todos los proveedores de chat (Twitch, YouTube, Kick…) deben producir este
 * tipo para que el resto de la aplicación no dependa de la plataforma.
 */
export interface ChatMessage {
  /** Identificador único del mensaje dentro de la plataforma. */
  id: string
  platform: ChatPlatform
  /** Canal (login, en minúsculas, sin `#`). */
  channel: string
  userId?: string
  /** Nombre de login del usuario. */
  username: string
  /** Nombre visible (con mayúsculas/emojis si la plataforma lo permite). */
  displayName: string
  /** Color del usuario en el chat, si está disponible. */
  color?: string
  /** Texto plano del mensaje. */
  text: string
  /** Nombres de las insignias del usuario (ej. `broadcaster`, `moderator`, `vip`). */
  badges: string[]
  isBroadcaster: boolean
  isMod: boolean
  isVip: boolean
  isSubscriber: boolean
  isFirstMessage: boolean
  /** Marca de tiempo en milisegundos. */
  timestamp: number
}
