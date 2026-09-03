import { redisClient } from './redis';
export async function checkRate(ip: string) {
  const key = `rate:${ip}`;
  const count = parseInt(await redisClient.get(key) || '0');
  if (count > 100) throw new Error('RATE_LIMITED');
  await redisClient.incr(key); await redisClient.expire(key, 60);
}
export const tiers = {
  PUBLIC:   { windowMs: 15*60*1000, max: 100 },
  AUTHENTICATED: { windowMs: 15*60*1000, max: 600 },
  ADMIN:    { windowMs: 15*60*1000, max: 3000 },
  BULK_EXPORT: { windowMs: 60*60*1000, max: 10 },
  AI_INFERENCE: { windowMs: 5*60*1000, max: 30 },
};
