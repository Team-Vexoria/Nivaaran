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

// Jaccard bigram similarity — mirrors verifyEngine.dedupHelpers.jaccardBigrams
function jaccardBigrams(a: string, b: string): number {
  if (!a || !b) return a === b ? 1 : 0;
  const bigrams = (s: string) => new Set(s.slice(0, -1).split('').map((_, i) => s.slice(i, i + 2)));
  const A = bigrams(a), B = bigrams(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const uni = A.size + B.size - inter;
  return uni === 0 ? 1 : inter / uni;
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

    // ── Near-duplicate scan (synchronous, pre-save) ──────────────────────────────
    // Same district + Jaccard(title) >= 0.72 + created within 14 days.
    // Runs AFTER exact-hash check so exact duplicates are caught first.
    if (!duplicateOf) {
      const reportTitle = (input.title || '').toLowerCase().trim();
      const districtCode = (input.district_code || input.district || '').toUpperCase();
      if (districtCode && reportTitle.length >= 10) {
        try {
          const recentWindow = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
          const candidates = await prisma.challenge.findMany({
            where: {
              district_code: districtCode,
              created_at: { gte: recentWindow },
              deleted_at: null,
            },
            select: { id: true, title: true, citizen_report_count: true },
            take: 50,
            orderBy: { created_at: 'desc' },
          });
          for (const candidate of candidates) {
            const sim = jaccardBigrams(reportTitle, (candidate.title || '').toLowerCase().trim());
            if (sim >= 0.72) {
              dedupStatus = 'NEAR_DUPLICATE';
              duplicateOf = candidate.id;
              // Merge: increment the primary's citizenReportCount.
              await prisma.challenge.update({
                where: { id: candidate.id },
                data: { citizen_report_count: { increment: 1 } },
              });
              break;
            }
          }
        } catch {
          // Prisma query failed — continue as ORIGINAL
        }
      }
    }

    const data = {
      id,
      title: input.title,
      description: input.description || '',
      status: (Object.values(ChallengeStatus).includes(input.status as ChallengeStatus)
        ? input.status as ChallengeStatus
        : ChallengeStatus.SUBMITTED),
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

    // ── Fire-and-forget: enqueue full 5-stage AI pipeline for background enrichment ──
    // Includes authoritative near-dup verification, priority scoring, university match.
    // Runs in aiQueue (in-process worker). Does NOT block the HTTP response.
    try {
      const { aiQueue } = await import('../../core/workers/index.js');
      aiQueue.add('pipeline', {
        action: 'pipeline',
        challengeId: id,
        payload: {
          challenge: {
            id,
            title: input.title,
            description: input.description || '',
            category: input.category || 'GENERAL',
            district_code: input.district_code || input.district || 'RANCHI',
            block_code: input.block_code || null,
            lat: input.lat,
            lng: input.lng,
            submitter_id: input.submitter_id || 'demo-citizen',
            submitter_type: (input.submitter_type as UserRole) || UserRole.CITIZEN,
            status: (Object.values(ChallengeStatus).includes(input.status as ChallengeStatus)
        ? input.status as ChallengeStatus
        : ChallengeStatus.SUBMITTED),
          },
          // exclude the newly-created challenge from the near-dup scan inside verifyReport
          // by passing its id in existingIds — the pipeline will skip self-matching.
          existingIds: [id],
          upvotes: 1,
        },
      }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
    } catch {
      // Queue unavailable (tests, etc.) — pipeline will run on-demand via /ai/pipeline
    }

    return { ...challenge, ...input, dedupStatus, duplicateOf };
  },

  async transition(id: string, action: string, auth: any, payload?: any, ifMatchVersion?: number) {
    const { transitionChallenge } = await import('../../core/workflowEngine.js');
    return transitionChallenge(id, action, auth, payload, ifMatchVersion);
  },
};