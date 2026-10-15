import { describe, expect, it } from 'vitest'

import type { ChatMessage } from '@/types/chat'
import type { FilterSettings } from '@/types/settings'

import { evaluateMessage } from './filters'

function makeMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: '1',
    platform: 'twitch',
    channel: 'test',
    username: 'gerardo',
    displayName: 'Gerardo',
    text: 'hola chat',
    badges: [],
    isBroadcaster: false,
    isMod: false,
    isVip: false,
    isSubscriber: false,
    isFirstMessage: false,
    timestamp: 0,
    ...overrides,
  }
}

const filters: FilterSettings = {
  ignoreCommands: true,
  ignoreUrls: true,
  maxLength: 100,
  ignoredUsers: [],
  cooldownSeconds: 0,
}

describe('evaluateMessage', () => {
  it('permite un mensaje normal y recorta el texto', () => {
    const result = evaluateMessage(makeMessage({ text: '  hola  ' }), filters)
    expect(result.allowed).toBe(true)
    expect(result.text).toBe('hola')
  })

  it('descarta mensajes vacíos', () => {
    expect(evaluateMessage(makeMessage({ text: '   ' }), filters).reason).toBe('empty')
  })

  it('descarta comandos si está activado', () => {
    expect(evaluateMessage(makeMessage({ text: '!comando' }), filters).reason).toBe('command')
    expect(
      evaluateMessage(makeMessage({ text: '!comando' }), {
        ...filters,
        ignoreCommands: false,
      }).allowed,
    ).toBe(true)
  })

  it('descarta URLs si está activado', () => {
    expect(evaluateMessage(makeMessage({ text: 'mira https://twitch.tv' }), filters).reason).toBe(
      'url',
    )
    expect(evaluateMessage(makeMessage({ text: 've a www.twitch.tv' }), filters).reason).toBe('url')
    expect(
      evaluateMessage(makeMessage({ text: 'mira https://twitch.tv' }), {
        ...filters,
        ignoreUrls: false,
      }).allowed,
    ).toBe(true)
  })

  it('descarta mensajes demasiado largos', () => {
    const result = evaluateMessage(makeMessage({ text: 'a'.repeat(101) }), filters)
    expect(result.reason).toBe('length')
  })

  it('descarta usuarios ignorados (sin distinguir mayúsculas)', () => {
    const result = evaluateMessage(makeMessage({ username: 'NightBot' }), {
      ...filters,
      ignoredUsers: ['nightbot'],
    })
    expect(result.reason).toBe('user')
  })
})
