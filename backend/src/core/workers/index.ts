import Bull from 'bull';
export const aiQueue = new Bull('ai.understand', { redis: process.env.REDIS_URL });
export const matchQueue = new Bull('challenge.match', { redis: process.env.REDIS_URL });
