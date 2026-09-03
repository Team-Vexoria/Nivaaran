// Provider interface + stub adapter + recommendations endpoint
import { aiQueue } from '../../core/aiWorker.js';
export async function submitAIJob(action: string, challengeId: string, payload?: any) {
  const job = await aiQueue.add('infer', { action, challengeId, payload }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  return { jobId: job.id, status: 'QUEUED' };
}
