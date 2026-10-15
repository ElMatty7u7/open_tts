import type { ChatPlatform } from '@/types/chat'

import { ChatProvider } from '../ChatProvider'
import { parseIrcLine, parseTwitchPrivmsg } from './ircParser'

/**
 * Endpoint IRC oficial de Twitch. Solo se admite el transporte seguro (wss).
 * La conexión no segura fue retirada en agosto de 2025.
 * @see https://dev.twitch.tv/docs/chat/irc/
 */
const TWITCH_IRC_URL = 'wss://irc-ws.chat.twitch.tv:443'
const MAX_RECONNECT_DELAY_MS = 15_000

function normalizeChannel(input: string): string {
  return input.trim().replace(/^#/, '').toLowerCase()
}

/**
 * Proveedor de chat de Twitch basado en IRC sobre WebSocket.
 *
 * Usa login anónimo de solo lectura (`justinfan`): no requiere OAuth, tokens ni
 * backend. Es la vía más simple soportada por Twitch para leer chat público.
 *
 * Nota: Twitch recomienda migrar a EventSub (que sí exige OAuth). Este proveedor
 * implementa la interfaz `ChatProvider` para poder sustituirlo en el futuro sin
 * tocar el resto de la aplicación.
 */
export class TwitchIrcProvider extends ChatProvider {
  readonly platform: ChatPlatform = 'twitch'

  private socket: WebSocket | null = null
  private channel = ''
  private shouldReconnect = false
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private resolveConnected: (() => void) | null = null
  private rejectConnected: ((error: Error) => void) | null = null

  async connect(channel: string): Promise<void> {
    this.disconnect()
    this.channel = normalizeChannel(channel)
    if (!this.channel) {
      throw new Error('Escribe un nombre de canal válido.')
    }
    this.shouldReconnect = true
    await this.open()
  }

  disconnect(): void {
    this.shouldReconnect = false
    this.reconnectAttempts = 0
    this.clearReconnectTimer()

    const socket = this.socket
    this.socket = null
    this.resolvePendingConnected()
    if (socket) {
      socket.close()
    }
    this.emit('status', { status: 'disconnected' })
  }

  private open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.emit('status', {
        status: this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting',
      })

      let socket: WebSocket
      try {
        socket = new WebSocket(TWITCH_IRC_URL)
      } catch (error) {
        reject(error instanceof Error ? error : new Error('No se pudo abrir el WebSocket.'))
        return
      }

      this.socket = socket
      this.resolveConnected = resolve
      this.rejectConnected = reject

      socket.addEventListener('open', () => this.handleOpen(socket))
      socket.addEventListener('message', (event) => this.handleData(event.data))
      socket.addEventListener('error', () => this.handleSocketError(socket))
      socket.addEventListener('close', () => this.handleClose(socket))
    })
  }

  private handleOpen(socket: WebSocket): void {
    // Pedimos los tags (metadatos) y los comandos de Twitch.
    socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands')
    // Login anónimo de solo lectura.
    socket.send('PASS SCHMOOPIIE')
    socket.send(`NICK justinfan${Math.floor(Math.random() * 90000) + 10000}`)
    socket.send(`JOIN #${this.channel}`)
  }

  private handleData(data: unknown): void {
    if (typeof data !== 'string') return
    for (const line of data.split('\r\n')) {
      if (line) this.handleLine(line)
    }
  }

  private handleLine(line: string): void {
    if (line.startsWith('PING')) {
      this.socket?.send('PONG :tmi.twitch.tv')
      return
    }

    const parsed = parseIrcLine(line)
    if (!parsed) return

    if (parsed.command === 'RECONNECT') {
      // Twitch avisa que debemos reconectar.
      this.socket?.close()
      return
    }

    if (parsed.command === '366' || parsed.command === 'JOIN') {
      // `366` = fin de la lista NAMES: ya estamos dentro del canal.
      this.markConnected()
      return
    }

    if (parsed.command === 'PRIVMSG') {
      const message = parseTwitchPrivmsg(parsed)
      if (message) this.emit('message', message)
      return
    }

    if (parsed.command === 'NOTICE') {
      const detail = parsed.trailing ?? 'Aviso del servidor de Twitch.'
      this.emit('error', { error: new Error(detail), fatal: false })
    }
  }

  private markConnected(): void {
    if (!this.resolveConnected) return
    this.reconnectAttempts = 0
    this.resolvePendingConnected()
    this.emit('status', { status: 'connected' })
  }

  private handleSocketError(socket: WebSocket): void {
    if (socket !== this.socket) return
    const error = new Error('Error de conexión con el chat de Twitch.')
    // Si aún no estábamos conectados, rechazamos la promesa de `connect`.
    if (this.rejectConnected) {
      const reject = this.rejectConnected
      this.resolveConnected = null
      this.rejectConnected = null
      reject(error)
      return
    }
    this.emit('error', { error, fatal: false })
  }

  private handleClose(socket: WebSocket): void {
    if (socket !== this.socket) return
    this.socket = null
    this.resolvePendingConnected()

    if (this.shouldReconnect) {
      this.emit('status', { status: 'reconnecting', detail: 'Conexión perdida. Reconectando…' })
      this.scheduleReconnect()
    } else {
      this.emit('status', { status: 'disconnected' })
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer) return
    this.reconnectAttempts += 1
    const delay = Math.min(1000 * 2 ** (this.reconnectAttempts - 1), MAX_RECONNECT_DELAY_MS)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.shouldReconnect) return
      this.open().catch((error: unknown) => {
        this.emit('error', {
          error: error instanceof Error ? error : new Error('Fallo al reconectar.'),
          fatal: false,
        })
      })
    }, delay)
  }

  private resolvePendingConnected(): void {
    this.resolveConnected?.()
    this.resolveConnected = null
    this.rejectConnected = null
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
