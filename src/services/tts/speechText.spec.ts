import { describe, expect, it } from 'vitest'

import type { ChatMessage } from '@/types/chat'

import { buildSpokenText } from './speechText'

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

describe('buildSpokenText', () => {
  it('lee solo el mensaje si el nombre está desactivado', () => {
    expect(
      buildSpokenText(makeMessage(), {
        readUsername: false,
        usernameTemplate: '{user} dice: {message}',
      }),
    ).toBe('hola chat')
  })

  it('incluye el nombre con la plantilla por defecto', () => {
    expect(
      buildSpokenText(makeMessage(), {
        readUsername: true,
        usernameTemplate: '{user} dice: {message}',
      }),
    ).toBe('Gerardo dice: hola chat')
  })

  it('usa una plantilla personalizada', () => {
    expect(
      buildSpokenText(makeMessage(), { readUsername: true, usernameTemplate: '{user}: {message}' }),
    ).toBe('Gerardo: hola chat')
  })
})
