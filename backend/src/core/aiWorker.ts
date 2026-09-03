import { Queue, Worker } from 'bullmq';
import { getRedis } from './redis.js';
const redisConnection = { connection: getRedis() };

export const aiQueue = new Queue('ai-processing', { connection: redisConnection });

export const aiWorker = new Worker('ai-processing', async (job) => {
  const { action, challengeId, payload } = job.data;
  // Async AI inference: understand / similarity / prioritize / match / vision
  return { action, challengeId, result: 'AI_COMPLETED', timestamp: new Date().toISOString() };
}, { connection: redisConnection });
