import { createId } from '@/lib/id'
import type { ChatMessage } from '@/types/chat'

/** Representación estructurada de una línea IRC. */
export interface ParsedIrcMessage {
  raw: string
  tags: Record<string, string>
  prefix: string | null
  nickname: string | null
  command: string
  params: string[]
  trailing: string | null
}

/**
 * Deshace el escapado de los valores de los tags IRC de Twitch.
 * @see https://ircv3.net/specs/extensions/message-tags
 */
export function unescapeTagValue(value: string): string {
  return value.replace(/\\([snrt:\\])/g, (_, code: string) => {
    switch (code) {
      case 's':
        return ' '
      case 'n':
        return '\n'
      case 'r':
        return '\r'
      case 't':
        return '\t'
      case ':':
        return ';'
      case '\\':
        return '\\'
      default:
        return code
    }
  })
}

function parseTags(raw: string): Record<string, string> {
  const tags: Record<string, string> = {}
  if (!raw) return tags

  for (const pair of raw.split(';')) {
    if (!pair) continue
    const equals = pair.indexOf('=')
    if (equals === -1) {
      tags[pair] = ''
      continue
    }
    tags[pair.slice(0, equals)] = unescapeTagValue(pair.slice(equals + 1))
  }
  return tags
}

/**
 * Parsea una línea del protocolo IRC de Twitch.
 * Devuelve `null` si la línea está vacía o mal formada.
 */
export function parseIrcLine(line: string): ParsedIrcMessage | null {
  let rest = line
  let tagsRaw = ''

  if (rest.startsWith('@')) {
    const space = rest.indexOf(' ')
    if (space === -1) return null
    tagsRaw = rest.slice(1, space)
    rest = rest.slice(space + 1)
  }

  let prefix: string | null = null
  if (rest.startsWith(':')) {
    const space = rest.indexOf(' ')
    if (space === -1) return null
    prefix = rest.slice(1, space)
    rest = rest.slice(space + 1)
  }

  let trailing: string | null = null
  const trailingIndex = rest.indexOf(' :')
  if (trailingIndex !== -1) {
    trailing = rest.slice(trailingIndex + 2)
    rest = rest.slice(0, trailingIndex)
  }

  const parts = rest.split(' ').filter(Boolean)
  const command = (parts.shift() ?? '').toUpperCase()
  if (!command) return null

  return {
    raw: line,
    tags: parseTags(tagsRaw),
    prefix,
    nickname: prefix ? (prefix.split('!')[0] ?? null) : null,
    command,
    params: parts,
    trailing,
  }
}

function splitBadges(rawBadges: string | undefined): string[] {
  if (!rawBadges) return []
  return rawBadges
    .split(',')
    .map((badge) => badge.split('/')[0])
    .filter(Boolean)
}

/** Convierte un `PRIVMSG` parseado en un `ChatMessage` normalizado. */
export function parseTwitchPrivmsg(parsed: ParsedIrcMessage): ChatMessage | null {
  if (parsed.command !== 'PRIVMSG') return null

  const channel = (parsed.params[0] ?? '').replace(/^#/, '').toLowerCase()
  const username = parsed.nickname ?? 'desconocido'
  const text = parsed.trailing ?? ''
  const badges = splitBadges(parsed.tags.badges)

  return {
    id: parsed.tags.id || createId(),
    platform: 'twitch',
    channel,
    userId: parsed.tags['user-id'] || undefined,
    username,
    displayName: parsed.tags['display-name'] || username,
    color: parsed.tags.color || undefined,
    text,
    badges,
    isBroadcaster: badges.includes('broadcaster'),
    isMod: parsed.tags.mod === '1' || badges.includes('moderator'),
    isVip: badges.includes('vip'),
    isSubscriber: parsed.tags.subscriber === '1' || badges.includes('subscriber'),
    isFirstMessage: parsed.tags['first-msg'] === '1',
    timestamp: Number(parsed.tags['tmi-sent-ts']) || Date.now(),
  }
}
