// Provider interface + stub adapter + recommendations endpoint
import { aiQueue } from '../../core/aiWorker.js';
export async function submitAIJob(action: string, challengeId: string, payload?: any) {
  const job = await aiQueue.add('infer', { action, challengeId, payload }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
  return { jobId: job.id, status: 'QUEUED' };
}
import { AIProvider, scorePriority, scoreHEIMatch } from './AIProvider.js';
export async function storeRecommendation(challengeId: string, kind: any, result: any, confidence: number, validationId?: string) {
  const { prisma } = await import('../../core/prisma.js');
  return prisma.aiRecommendation.create({ data: {
    challenge_id: challengeId, kind, status: 'SUCCEEDED', result: JSON.parse(JSON.stringify(result)),
    confidence: confidence, model_version: 'Nivaaran-v1.0', completed_at: new Date(),
    audit_events: validationId ? { connect: { id: validationId } } : undefined,
  }});
}
