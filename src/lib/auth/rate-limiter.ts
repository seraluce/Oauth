import { getCache } from "@/lib/redis";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  "forgot-password": { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  "verification-code": { windowMs: 10 * 60 * 1000, maxRequests: 3 },
  api: { windowMs: 60 * 1000, maxRequests: 60 },
  "oauth-token": { windowMs: 60 * 1000, maxRequests: 30 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

export async function checkRateLimit(
  category: keyof typeof LIMITS,
  identifier: string
): Promise<RateLimitResult> {
  const config = LIMITS[category] || LIMITS.api;
  const cache = getCache();
  const key = `ratelimit:${category}:${identifier}`;
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  const now = Date.now();
  const windowStart = now - config.windowMs;

  const current = await cache.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= config.maxRequests) {
    const ttl = await cache.get(`${key}:reset`);
    const resetAt = ttl ? parseInt(ttl, 10) : now + config.windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterMs: resetAt - now,
    };
  }

  const newCount = await cache.incr(key);
  if (newCount === 1) {
    await cache.expire(key, windowSeconds);
    await cache.set(`${key}:reset`, String(now + config.windowMs), windowSeconds);
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - newCount),
    resetAt: now + config.windowMs,
    retryAfterMs: 0,
  };
}
