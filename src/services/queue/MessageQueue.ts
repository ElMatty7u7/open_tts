import { createId } from '@/lib/id'

/** Elemento encolado. Envuelve un payload con metadatos de orden. */
export interface QueueEntry<T> {
  id: string
  payload: T
  /** A mayor prioridad, antes se reproduce. */
  priority: number
  enqueuedAt: number
}

/** Opciones al encolar. */
export interface EnqueueOptions {
  /** Prioridad del elemento (por defecto 0). */
  priority?: number
  /** Identificador propio (por defecto se genera uno). */
  id?: string
}

type QueueListener<T> = (entries: readonly QueueEntry<T>[]) => void

/**
 * Cola de reproducción propia, independiente de Vue y del motor TTS.
 *
 * La V0.1 solo usa orden FIFO (todos los elementos tienen prioridad 0), pero la
 * estructura ya soporta prioridades, eliminación por id y suscripción a cambios
 * para poder añadir reglas (subs/VIP, cooldowns, límites…) sin reescribirla.
 */
export class MessageQueue<T> {
  private entries: QueueEntry<T>[] = []
  private readonly listeners = new Set<QueueListener<T>>()

  /** Añade un elemento a la cola y devuelve la entrada creada. */
  enqueue(payload: T, options: EnqueueOptions = {}): QueueEntry<T> {
    const entry: QueueEntry<T> = {
      id: options.id ?? createId(),
      payload,
      priority: options.priority ?? 0,
      enqueuedAt: Date.now(),
    }
    this.entries.push(entry)
    this.sort()
    this.notify()
    return entry
  }

  /** Extrae el siguiente elemento (el de mayor prioridad y más antiguo). */
  dequeue(): QueueEntry<T> | undefined {
    const entry = this.entries.shift()
    if (entry) this.notify()
    return entry
  }

  /** Consulta el siguiente elemento sin extraerlo. */
  peek(): QueueEntry<T> | undefined {
    return this.entries[0]
  }

  /** Elimina un elemento por id. Devuelve si se encontró. */
  remove(id: string): boolean {
    const index = this.entries.findIndex((entry) => entry.id === id)
    if (index === -1) return false
    this.entries.splice(index, 1)
    this.notify()
    return true
  }

  /** Vacía la cola. */
  clear(): void {
    if (this.entries.length === 0) return
    this.entries = []
    this.notify()
  }

  get size(): number {
    return this.entries.length
  }

  /** Devuelve una copia de solo lectura de los elementos actuales. */
  getEntries(): readonly QueueEntry<T>[] {
    return this.entries
  }

  /** Se suscribe a los cambios. Devuelve una función para cancelar. */
  subscribe(listener: QueueListener<T>): () => void {
    this.listeners.add(listener)
    listener(this.entries)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private sort(): void {
    // `Array.prototype.sort` es estable: mantiene el orden FIFO a igual prioridad.
    this.entries.sort((a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.entries))
  }
}
