import { describe, expect, it } from 'vitest'

import { parseIrcLine, parseTwitchPrivmsg, unescapeTagValue } from './ircParser'

const PRIVMSG =
  '@badge-info=;badges=subscriber/12,premium/1;color=#0000FF;display-name=Gerardo;' +
  'emotes=;first-msg=1;id=abc-123;mod=0;room-id=1;subscriber=1;' +
  'tmi-sent-ts=1690000000000;user-id=456;user-type= ' +
  ':gerardo!gerardo@gerardo.tmi.twitch.tv PRIVMSG #elmatty7u7 :hola chat'

describe('parseIrcLine', () => {
  it('parsea tags, prefijo, comando y trailing', () => {
    const parsed = parseIrcLine(PRIVMSG)
    expect(parsed).not.toBeNull()
    expect(parsed?.command).toBe('PRIVMSG')
    expect(parsed?.nickname).toBe('gerardo')
    expect(parsed?.params).toEqual(['#elmatty7u7'])
    expect(parsed?.trailing).toBe('hola chat')
    expect(parsed?.tags['display-name']).toBe('Gerardo')
  })

  it('parsea PING del servidor', () => {
    const parsed = parseIrcLine('PING :tmi.twitch.tv')
    expect(parsed?.command).toBe('PING')
    expect(parsed?.trailing).toBe('tmi.twitch.tv')
  })

  it('devuelve null para líneas vacías o inválidas', () => {
    expect(parseIrcLine('')).toBeNull()
    expect(parseIrcLine('@solo-tags')).toBeNull()
  })

  it('deshace el escapado de los tags', () => {
    expect(unescapeTagValue('uno\\sdos')).toBe('uno dos')
    expect(unescapeTagValue('a\\:b')).toBe('a;b')
  })
})

describe('parseTwitchPrivmsg', () => {
  it('normaliza el mensaje', () => {
    const message = parseTwitchPrivmsg(parseIrcLine(PRIVMSG)!)
    expect(message).not.toBeNull()
    expect(message).toMatchObject({
      id: 'abc-123',
      platform: 'twitch',
      channel: 'elmatty7u7',
      username: 'gerardo',
      displayName: 'Gerardo',
      text: 'hola chat',
      color: '#0000FF',
      userId: '456',
      isSubscriber: true,
      isFirstMessage: true,
      isMod: false,
      isVip: false,
      isBroadcaster: false,
    })
    expect(message?.timestamp).toBe(1690000000000)
    expect(message?.badges).toEqual(['subscriber', 'premium'])
  })

  it('ignora comandos que no son PRIVMSG', () => {
    expect(parseTwitchPrivmsg(parseIrcLine('PING :tmi.twitch.tv')!)).toBeNull()
  })
})
