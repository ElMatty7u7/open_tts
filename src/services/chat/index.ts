import type { ChatPlatform } from '@/types/chat'

import type { ChatProvider } from './ChatProvider'
import { TwitchIrcProvider } from './twitch/TwitchIrcProvider'

type ChatProviderFactory = () => ChatProvider

/**
 * Registro de proveedores de chat disponibles.
 *
 * Añadir una plataforma nueva (YouTube, Kick…) consiste en implementar
 * `ChatProvider` y registrarla aquí.
 */
const providers: Partial<Record<ChatPlatform, ChatProviderFactory>> = {
  twitch: () => new TwitchIrcProvider(),
  // youtube: () => new YouTubeChatProvider(), // pendiente
  // kick: () => new KickChatProvider(),       // pendiente
}

export function createChatProvider(platform: ChatPlatform): ChatProvider {
  const factory = providers[platform]
  if (!factory) {
    throw new Error(`La plataforma de chat "${platform}" todavía no está soportada.`)
  }
  return factory()
}

export { ChatProvider } from './ChatProvider'
