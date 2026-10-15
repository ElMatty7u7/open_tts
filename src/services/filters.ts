import type { ChatMessage } from '@/types/chat'
import type { FilterSettings } from '@/types/settings'

export type FilterReason = 'empty' | 'command' | 'url' | 'length' | 'user'

export interface FilterDecision {
  allowed: boolean
  reason?: FilterReason
  /** Texto ya recortado, listo para el TTS. */
  text: string
}

const URL_PATTERN = /(https?:\/\/|www\.)\S+/i

/** Decide si un mensaje debe leerse, aplicando los filtros configurados. */
export function evaluateMessage(message: ChatMessage, filters: FilterSettings): FilterDecision {
  const text = message.text.trim()

  if (!text) return { allowed: false, reason: 'empty', text }

  if (filters.ignoreCommands && text.startsWith('!')) {
    return { allowed: false, reason: 'command', text }
  }

  const ignoredUsers = filters.ignoredUsers.map((user) => user.trim().toLowerCase()).filter(Boolean)
  if (ignoredUsers.includes(message.username.toLowerCase())) {
    return { allowed: false, reason: 'user', text }
  }

  if (filters.ignoreUrls && URL_PATTERN.test(text)) {
    return { allowed: false, reason: 'url', text }
  }

  if (filters.maxLength > 0 && text.length > filters.maxLength) {
    return { allowed: false, reason: 'length', text }
  }

  return { allowed: true, text }
}
