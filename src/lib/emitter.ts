type UnknownListener = (payload: unknown) => void

/**
 * Emisor de eventos tipado y mínimo, sin dependencias.
 *
 * Se usa para desacoplar los servicios (proveedores de chat, cola…) de Vue.
 */
export class Emitter<Events extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof Events, Set<UnknownListener>>()

  /** Suscribe un listener. Devuelve una función para cancelar la suscripción. */
  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): () => void {
    const set = this.listeners.get(event) ?? new Set<UnknownListener>()
    const wrapped = listener as unknown as UnknownListener
    set.add(wrapped)
    this.listeners.set(event, set)
    return () => {
      set.delete(wrapped)
    }
  }

  /** Cancela una suscripción concreta. */
  off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void {
    this.listeners.get(event)?.delete(listener as unknown as UnknownListener)
  }

  /** Emite un evento a todos los suscriptores. */
  protected emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners.get(event)?.forEach((listener) => listener(payload))
  }

  /** Elimina todos los listeners. */
  protected clearListeners(): void {
    this.listeners.clear()
  }
}
