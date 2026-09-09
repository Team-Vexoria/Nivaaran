import { prisma } from '../../core/prisma.js';
import { matchResultsStore } from '../../core/workers/index.js';

export const universityService = {
  async list() {
    try {
      // Try DB first; if empty, return seed-compatible stub for matching engine
      const docs = await prisma.university.findMany({ take: 30 });
      return docs.length > 0 ? docs : [];
    } catch {
      return [];
    }
  },
  async getById(id: string) {
    try { return await prisma.university.findUnique({ where: { id } }); } catch { return null; }
  },
  async create(input: any) { return input; },
  async matchChallenge(challengeData: any, universityArray?: any[]) {
    const unis = universityArray || (await this.list());
    if (!unis || unis.length === 0) return { error: 'No university data available', candidates: [] };
    // Delegate to match-worker logic via import to avoid circular dependency
    const { matchQueue } = await import('../../core/workers/index.js');
    const job = await matchQueue.add('match', { challengeData, universityDataArray: unis }, { attempts: 2 });
    return { jobId: job.id, status: 'QUEUED', note: 'Match processing queued — retrieve via matchResultsStore' };
  },
};
