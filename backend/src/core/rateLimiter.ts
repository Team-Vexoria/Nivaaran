import { redisClient } from './redis';
export async function checkRate(ip: string) {
  const key = `rate:${ip}`;
  const count = parseInt(await redisClient.get(key) || '0');
  if (count > 100) throw new Error('RATE_LIMITED');
  await redisClient.incr(key); await redisClient.expire(key, 60);
}
