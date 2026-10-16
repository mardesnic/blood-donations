// Fixed-window counter of failed attempts per key, kept in memory.
// On serverless hosting every instance has its own counters, so this slows
// down password guessing rather than enforcing a hard global limit.
type Entry = { count: number; resetAt: number };

const MAX_KEYS = 10_000;

export class FailureLimiter {
  private entries = new Map<string, Entry>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  private current(key: string, now: number): Entry | null {
    const entry = this.entries.get(key);
    if (entry && entry.resetAt <= now) {
      this.entries.delete(key);
      return null;
    }
    return entry ?? null;
  }

  isLimited(key: string | null | undefined, now = Date.now()): boolean {
    if (!key) {
      return false;
    }
    const entry = this.current(key, now);
    return !!entry && entry.count >= this.limit;
  }

  recordFailure(key: string | null | undefined, now = Date.now()): void {
    if (!key) {
      return;
    }
    const entry = this.current(key, now);
    if (entry) {
      entry.count += 1;
      return;
    }
    if (this.entries.size >= MAX_KEYS) {
      // Drop the oldest key so memory stays bounded.
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) {
        this.entries.delete(oldest);
      }
    }
    this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
  }

  reset(key: string | null | undefined): void {
    if (key) {
      this.entries.delete(key);
    }
  }
}
