import type { CacheAdapter } from "./interface";

interface CacheEntry {
  value: string;
  expiresAt: number | null;
}

export class MemoryAdapter implements CacheAdapter {
  private store = new Map<string, CacheEntry>();

  private isExpired(entry: CacheEntry): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key);
    const current = entry && !this.isExpired(entry) ? parseInt(entry.value, 10) : 0;
    const next = current + 1;
    this.store.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt ?? null,
    });
    return next;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    const result: string[] = [];
    for (const [key, entry] of this.store.entries()) {
      if (!this.isExpired(entry) && regex.test(key)) {
        result.push(key);
      }
    }
    return result;
  }
}
