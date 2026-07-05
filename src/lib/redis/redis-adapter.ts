import type { CacheAdapter } from "./interface";

export class RedisAdapter implements CacheAdapter {
  private client: any;

  constructor(url: string) {
    // Dynamic import for ioredis - only loaded when Redis is configured
    // For environments without ioredis, falls back to memory adapter
    try {
      const Redis = require("ioredis");
      this.client = new Redis(url, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    } catch {
      throw new Error("ioredis package not installed. Run: npm install ioredis");
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
}
