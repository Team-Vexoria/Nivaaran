import { prisma } from '../../core/prisma.js';
import { ChallengeStatus, UserRole } from '@prisma/client';

// Deterministic dedup hash — mirrors verifyEngine.computeHash so the hash written
// at create-time can be matched by later verifyReport() calls.
function computeDedupHash(report: any): string {
  const key = `${(report.title || '').toLowerCase().trim()}|${(report.description || '').toLowerCase().trim().slice(0, 180)}|${(report.district || '').toLowerCase()}|${(report.category || '').toLowerCase()}`;
  const normalized = key.replace(/\s+/g, ' ').trim();
  let h = 0;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h = ((h << 5) - h) + ch;
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

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

    // ── Dedup (T2.1): exact-hash lookup against the persisted DedupRecord table ──
    // If the caller already ran verifyReport(), its hash is attached as
    // report.__dedupHash; otherwise recompute here so the write path is
    // always transactional-consistent with the verification path.
    const reportForHash = input.report || input;
    const dedupHash = input.__dedupHash || computeDedupHash(reportForHash);
    let dedupStatus: string | null = input.dedupStatus || null;
    let duplicateOf: string | null = input.duplicateOf || null;

    if (!duplicateOf) {
      try {
        const record = await (prisma as any).dedupRecord.findUnique({
          where: { hash: dedupHash },
          select: { challenge_id: true },
        });
        if (record) {
          dedupStatus = 'DUPLICATE';
          duplicateOf = record.challenge_id;
          // Merge (not reject): increment the primary's citizenReportCount.
          await prisma.challenge.update({
            where: { id: record.challenge_id },
            data: { citizen_report_count: { increment: 1 } },
          });
        }
      } catch {
        // DedupRecord table not yet migrated — safe to skip
      }
    }

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
      dedup_status: dedupStatus,
      duplicate_of: duplicateOf,
    };

    // Single transaction: Challenge + DedupRecord + outbox event (all-or-nothing)
    const [challenge] = await prisma.$transaction(async (tx) => {
      const created = await tx.challenge.create({ data });

      if (dedupStatus === 'ORIGINAL' || dedupStatus === null) {
        await tx.dedupRecord.create({
          data: {
            hash: dedupHash,
            challenge_id: id,
            district: input.district_code || input.district || null,
            lat: typeof input.lat === 'number' ? input.lat : null,
            lng: typeof input.lng === 'number' ? input.lng : null,
            created_at: new Date(),
          },
        });
      }

      await tx.outboxEvent.create({
        data: {
          event_type: 'challenge:created',
          aggregate_type: 'challenge',
          aggregate_id: id,
          payload: { id, title: input.title, dedupStatus },
          created_at: new Date(),
        },
      });
      return [created];
    });

    return { ...challenge, ...input, dedupStatus, duplicateOf };
  },

  async transition(id: string, action: string, auth: any, payload?: any, ifMatchVersion?: number) {
    const { transitionChallenge } = await import('../../core/workflowEngine.js');
    return transitionChallenge(id, action, auth, payload, ifMatchVersion);
  },
};