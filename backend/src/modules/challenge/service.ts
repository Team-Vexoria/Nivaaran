import { prisma } from '../../core/prisma.js';
import { ChallengeStatus, UserRole } from '@prisma/client';

export const challengeService = {
  async list() {
    return prisma.challenge.findMany({
      where: { deleted_at: null },
      take: 50,
      orderBy: { created_at: 'desc' },
    });
  },

  async getById(id: string) {
    return prisma.challenge.findUnique({
      where: { id },
      include: {
        evidence: true,
        validations: { take: 10, orderBy: { decided_at: 'desc' } },
        project: true,
      },
    });
  },

  async timeline(id: string) {
    return prisma.auditEvent.findMany({
      where: { resource_id: id },
      orderBy: { created_at: 'asc' },
    });
  },

  async getTimeline(id: string) {
    return this.timeline(id);
  },

  async mine(submitterId?: string) {
    if (!submitterId) return [];
    return prisma.challenge.findMany({
      where: { submitter_id: submitterId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  },

  async create(input: any) {
    const id = input.id || crypto.randomUUID();
    const data = {
      id,
      title: input.title,
      description: input.description || '',
      status: input.status || ChallengeStatus.SUBMITTED,
      district_code: input.district_code || input.district || 'RANCHI',
      block_code: input.block_code || null,
      submitter_id: input.submitter_id || 'demo-citizen',
      category: input.category || 'GENERAL',
      sub_category: input.sub_category || null,
      version: 1,
      submitter_type: (input.submitter_type as UserRole) || UserRole.CITIZEN,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const challenge = await prisma.challenge.create({ data });
    await prisma.outboxEvent.create({
      data: {
        event_type: 'challenge:created',
        aggregate_type: 'challenge',
        aggregate_id: id,
        payload: { id, title: input.title },
        created_at: new Date(),
      },
    });
    return { ...challenge, ...input };
  },

  async transition(id: string, action: string, auth: any, payload?: any, ifMatchVersion?: number) {
    const { transitionChallenge } = await import('../../core/workflowEngine.js');
    return transitionChallenge(id, action, auth, payload, ifMatchVersion);
  },
};