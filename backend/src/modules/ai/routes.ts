import { Router } from 'express';
import { extractEntities } from './entityExtractor';
import { researchProblem } from './internetResearch';
import { scorePriority } from './AIProvider';
import { verifyReport } from './verifyEngine';
import { prisma } from '../../core/prisma';
import { runAIPipeline } from '../../core/workers/ai-worker';

const r = Router();

// GET AI decision trace for a challenge
r.get('/ai-decision-trace/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const challenge = await (prisma as any).challenge.findUnique({
      where: { id: challengeId },
      include: {
        ai_recommendations: { orderBy: { created_at: 'asc' } },
      },
    });
    if (!challenge) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Challenge not found' } });
    const timeline = await (prisma as any).auditEvent.findMany({
      where: { resource_type: 'challenge', resource_id: challengeId },
      orderBy: { created_at: 'asc' },
      take: 100,
    });
    return res.json({
      ok: true,
      data: {
        challengeId,
        status: challenge.status,
        verification: {
          isRealReport: challenge.ai_confidence != null,
          confidence: challenge.ai_confidence ?? null,
          dedupStatus: challenge.dedup_status ?? null,
          duplicateOf: challenge.duplicate_of ?? null,
          domainCode: challenge.ai_domain ?? null,
          domainName: challenge.category ?? null,
          visionResult: challenge.vision_result ?? null,
        },
        understanding: {
          summary: challenge.ai_summary ?? null,
          domain: challenge.ai_domain ?? null,
          subDomain: challenge.ai_sub_domain ?? null,
          tags: challenge.ai_tags ?? [],
          severity: challenge.ai_severity ?? null,
          urgency: challenge.ai_urgency ?? null,
          confidence: challenge.ai_confidence ?? null,
        },
        research: challenge.research_result ?? null,
        priority: {
          factors: challenge.priority_factors ?? null,
          priorityScore: challenge.priority_score ?? null,
        },
        timeline,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'TRACE_FAILED', message: err.message || 'Failed to load decision trace' } });
  }
});

// POST Stage 4: Entity Extraction
r.post('/extract-entities', async (req, res) => {
  try {
    const { description, title } = req.body;
    if (!description && !title) {
      return res.status(400).json({ error: 'Description or title is required' });
    }
    const entities = await extractEntities(description || '', title || '');
    return res.json({ success: true, data: entities });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Entity extraction failed' });
  }
});

// POST Stage 4: Internet & Government Intelligence Research
r.post('/research-problem', async (req, res) => {
  try {
    const { entities } = req.body;
    const research = await researchProblem(entities || {});
    return res.json({ success: true, data: research });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Internet research failed' });
  }
});

// POST Stage 5: 4-Pillar (25% x 4) Priority Scoring
r.post('/score-priority', async (req, res) => {
  try {
    const { challenge, spatial, upvotes, researchResult } = req.body;
    const result = scorePriority(challenge || {}, spatial, upvotes || 0, researchResult);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Priority scoring failed' });
  }
});

// POST Verification, Dedup & Categorization
r.post('/verify-report', async (req, res) => {
  try {
    const { report, existingIds } = req.body;
    if (!report) return res.status(400).json({ error: 'Report required' });
    const result = await verifyReport(report, existingIds);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Verification failed' });
  }
});

// POST Full 5-stage AI pipeline (verify → understand → research → prioritize → match)
// Used by the frontend after citizen report submission to enrich with backend research,
// university matches, and dedup verification. No challengeId required — works without DB.
r.post('/pipeline', async (req, res) => {
  try {
    const { challenge, upvotes, existingIds, universities } = req.body;
    if (!challenge) {
      return res.status(400).json({ ok: false, error: { code: 'VALIDATION', message: 'Challenge payload is required' } });
    }
    const result = await runAIPipeline({
      challenge,
      upvotes: upvotes || 0,
      existingIds,
      universities,
    });
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: { code: 'PIPELINE_FAILED', message: err.message || 'AI pipeline failed' } });
  }
});

export default r;
