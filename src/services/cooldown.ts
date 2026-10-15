/**
 * Control de cooldown por usuario.
 *
 * Limita cada cuánto puede leerse un mensaje de un mismo usuario para evitar
 * que un spammer sature la cola.
 */
export class UserCooldown {
  private readonly lastSpokenAt = new Map<string, number>()
  private cooldownMs: number

  constructor(cooldownMs = 0) {
    this.cooldownMs = cooldownMs
  }

  setCooldown(cooldownMs: number): void {
    this.cooldownMs = cooldownMs
  }

  /** Indica si el usuario sigue en cooldown. */
  isOnCooldown(username: string, now: number = Date.now()): boolean {
    if (this.cooldownMs <= 0) return false
    const last = this.lastSpokenAt.get(username.toLowerCase())
    return last !== undefined && now - last < this.cooldownMs
  }

  /** Marca que se acaba de leer a un usuario. */
  markSpoken(username: string, now: number = Date.now()): void {
    this.lastSpokenAt.set(username.toLowerCase(), now)
  }

  reset(): void {
    this.lastSpokenAt.clear()
  }
}
