import { describe, expect, it } from 'vitest'

import { MessageQueue } from './MessageQueue'

describe('MessageQueue', () => {
  it('respeta el orden FIFO', () => {
    const queue = new MessageQueue<string>()
    queue.enqueue('a')
    queue.enqueue('b')
    queue.enqueue('c')

    expect(queue.size).toBe(3)
    expect(queue.dequeue()?.payload).toBe('a')
    expect(queue.dequeue()?.payload).toBe('b')
    expect(queue.dequeue()?.payload).toBe('c')
    expect(queue.dequeue()).toBeUndefined()
  })

  it('ordena por prioridad y luego por antigüedad', () => {
    const queue = new MessageQueue<string>()
    queue.enqueue('normal-1')
    queue.enqueue('urgente', { priority: 10 })
    queue.enqueue('normal-2')

    expect(queue.dequeue()?.payload).toBe('urgente')
    expect(queue.dequeue()?.payload).toBe('normal-1')
    expect(queue.dequeue()?.payload).toBe('normal-2')
  })

  it('elimina por id', () => {
    const queue = new MessageQueue<string>()
    queue.enqueue('a', { id: 'a' })
    queue.enqueue('b', { id: 'b' })

    expect(queue.remove('a')).toBe(true)
    expect(queue.remove('a')).toBe(false)
    expect(queue.size).toBe(1)
    expect(queue.peek()?.payload).toBe('b')
  })

  it('vacía la cola y notifica a los suscriptores', () => {
    const queue = new MessageQueue<string>()
    let notifications = 0
    const unsubscribe = queue.subscribe(() => {
      notifications += 1
    })

    queue.enqueue('a')
    queue.enqueue('b')
    queue.clear()

    expect(queue.size).toBe(0)
    expect(notifications).toBe(4) // suscripción inicial + 2 enqueue + clear

    unsubscribe()
    queue.enqueue('c')
    expect(notifications).toBe(4)
  })
})
