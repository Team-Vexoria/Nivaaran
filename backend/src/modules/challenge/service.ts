import { prisma } from '../../core/prisma.js';
import { ChallengeStatus } from '@prisma/client';

export const challengeService = {
  async list() { return prisma.challenge.findMany({ take: 50, orderBy: { created_at: 'desc' } }); },
  async create(input: any) {
    const id = input.id || crypto.randomUUID();
    return prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO "Challenge" (id, title, description, status, district_code, block_code, submitter_id, category, version, source, source_id, submitter_type, visibility, location, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1,'API',$1,'CITIZEN','PUBLIC',ST_SetSRID(ST_MakePoint($9,$10),4326),NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        id, input.title, input.description, input.status || "IN_REVIEW", input.district_code, input.block_code, input.submitter_id, input.category || 'GENERAL', input.lon || 85.3, input.lat || 23.5
      );
      await tx.outboxEvent.create({
        data: {
          event_type: 'challenge:created',
          aggregate_type: 'challenge',
          aggregate_id: id,
          payload: { id, title: input.title },
          created_at: new Date(),
        },
      });
      return { id, ...input };
    });
  },

  async transition(id: string, action: string, auth: any) {
    const { transitionChallenge } = await import('../../core/workflowEngine.js');
    return transitionChallenge(id, action, auth);
  },
};