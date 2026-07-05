import type { CacheAdapter } from "./interface";
import { MemoryAdapter } from "./memory-adapter";
import { RedisAdapter } from "./redis-adapter";

let _cache: CacheAdapter | null = null;

export function getCache(): CacheAdapter {
  if (_cache) return _cache;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      _cache = new RedisAdapter(redisUrl);
      console.log("[Cache] Using Redis adapter");
      return _cache;
    } catch (err) {
      console.warn("[Cache] Redis unavailable, falling back to memory adapter:", err);
    }
  }

  _cache = new MemoryAdapter();
  console.log("[Cache] Using in-memory adapter");
  return _cache;
}

export type { CacheAdapter };
