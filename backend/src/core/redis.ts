import Redis from 'ioredis';
import { getConfig } from './config';
import { logger } from './logger';

// ── Singleton ────────────────────────────────────────────────────────

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  const { REDIS_URL } = getConfig();
  _redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      return Math.min(times * 50, 2000);
    },
  });
  _redis.on('error', (err) => logger.error({ err }, 'Redis error'));
  _redis.on('connect', () => logger.info('Redis connected'));
  return _redis;
}

// ── Namespaced helpers ──────────────────────────────────────────────

const NS = 'nivaaran:';

export function nsKey(...parts: string[]): string {
  return NS + parts.join(':');
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await getRedis().get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
  try {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // fire-and-forget; cache is a performance optimization, not a correctness requirement
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  try {
    if (keys.length) await getRedis().del(...keys);
  } catch {
    // no-op
  }
}
