import type { ChatMessage } from '@/types/chat'
import type { TtsSettings } from '@/types/settings'

export const DEFAULT_USERNAME_TEMPLATE = '{user} dice: {message}'

/** Construye el texto final que leerá el TTS, incluyendo el usuario si procede. */
export function buildSpokenText(
  message: ChatMessage,
  options: Pick<TtsSettings, 'readUsername' | 'usernameTemplate'>,
): string {
  const text = message.text.trim()
  if (!options.readUsername) return text

  const template = options.usernameTemplate.trim() || DEFAULT_USERNAME_TEMPLATE
  return template.replace(/\{user\}/gi, message.displayName).replace(/\{message\}/gi, text)
}
