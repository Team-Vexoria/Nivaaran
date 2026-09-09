import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildExtractedEntities,
  runAIPipeline,
} from '../src/core/workers/ai-worker';

describe('STEP 7A — AI Worker Pipeline Orchestration (SIH 26043)', () => {
  // ── §2–§3: Standardized ExtractedEntities construction ─────────────────────
  describe('buildExtractedEntities — standardized entity construction', () => {
    it('should resolve location (district, block, coordinates) from challenge.location', () => {
      const challenge = {
        title: 'Waterlogging near Harmu bypass',
        category: 'Drainage',
        location: { district: 'Ranchi', block: 'Harmu', lat: 23.34, lng: 85.31 },
        affectedPopulation: 1500,
        economicValue: 250000,
        hazardUrgency: 8,
        createdAt: '2026-09-09T14:30:00.000Z',
      };

      const e = buildExtractedEntities(challenge, undefined, {}, undefined, 12);

      assert.equal(e.district, 'Ranchi');
      assert.equal(e.location.block, 'Harmu');
      assert.equal(e.location.lat, 23.34);
      assert.equal(e.location.lng, 85.31);
    });

    it('should fall back to payload.spatial and DISTRICT_COORDS when location is missing', () => {
      const challenge = {
        title: 'Road subsidence in Dhanbad',
        category: 'Road',
        hazardUrgency: 7,
      };
      const spatial = { district: 'Dhanbad' };

      const e = buildExtractedEntities(challenge, spatial, {}, undefined, 3);

      assert.equal(e.district, 'Dhanbad');
      // Coordinates resolved from DISTRICT_COORDS centroid (Dhanbad ≈ 23.79, 86.43)
      assert.ok(Math.abs(e.location.lat - 23.7957) < 0.01);
      assert.ok(Math.abs(e.location.lng - 86.4304) < 0.01);
    });

    it('should extract category/hazard/eventDate with correct default fallbacks', () => {
      const challenge = {
        title: 'Bridge collapse risk',
        category: 'Infrastructure',
        createdAt: '2026-08-15T09:00:00.000Z',
      };

      const e = buildExtractedEntities(challenge, undefined, {}, undefined, 1);

      // infrastructureType defaults to challenge.category
      assert.equal(e.infrastructureType, 'Infrastructure');
      // hazardType defaults to challenge.title (no understanding.hazardType/domain)
      assert.equal(e.hazardType, 'Bridge collapse risk');
      // eventDate derived (ISO YYYY-MM-DD) from challenge.createdAt
      assert.equal(e.eventDate, '2026-08-15');
      assert.match(e.eventDate, /^\d{4}-\d{2}-\d{2}$/);
    });

    it('should prefer explicit challenge numerics over generic AI understand defaults', () => {
      const challenge = {
        title: 'Flood',
        category: 'Drainage',
        affectedPopulation: 2000,
        economicValue: 300000,
        hazardUrgency: 9,
      };
      // Deterministic understand() returns generic urgency: 5 / severity: MEDIUM — must NOT override
      const understanding = { urgency: 5, severity: 'MEDIUM', domain: 'FLOOD_RISK' };

      const e = buildExtractedEntities(challenge, undefined, understanding, undefined, 18);

      assert.equal(e.hazardUrgency, 9);
      assert.equal(e.affectedPopulation, 2000);
      assert.equal(e.economicValue, 300000);
      assert.equal(e.upvotes, 18);
      // urgency 9 -> severity CRITICAL
      assert.equal(e.severity, 'CRITICAL');
    });
  });

  // ── §1: Full 5-stage pipeline sequence ─────────────────────────────────────
  describe('runAIPipeline — verify → understand → research → prioritize → match', () => {
    it('should execute all 5 stages in strict order and assemble a complete trace', async () => {
      const payload = {
        challenge: {
          title: 'Severe waterlogging and drainage overflow near Harmu bypass, Ranchi',
          description: 'Flood water entering 200 homes affecting over 1500 residents; risk of electrical short circuit.',
          district: 'Ranchi',
          category: 'Drainage',
          location: { district: 'Ranchi', block: 'Harmu', lat: 23.34, lng: 85.31 },
          affectedPopulation: 1500,
          economicValue: 250000,
          hazardUrgency: 8,
          estimatedCost: 250000,
          createdAt: '2026-09-09T14:30:00.000Z',
        },
        upvotes: 12,
        // Inject research to keep the test deterministic and offline
        researchResult: {
          confidence: 0.92,
          activeAlert: true,
          recurringHazardIdentified: true,
          corroborationCount: 3,
          governmentAdvisories: ['Emergency municipal tender issued for evacuation and drainage scheme'],
          recentIncidents: [{ title: 'Widespread commercial damage and road collapse', snippet: 'inundation' }],
        },
        universities: [
          { id: 'u1', name: 'NIT Jamshedpur', departments: ['Drainage'], labs: ['GIS Lab'], accreditation: 'A+' },
          { id: 'u2', name: 'BIT Sindri', departments: ['Mining'], labs: [], accreditation: 'A' },
        ],
      };

      const res = await runAIPipeline(payload, 'test-job-7a', 'ch-7a');

      // Strict stage ordering
      assert.deepEqual(res.pipeline, ['verify', 'understand', 'research', 'prioritize', 'match']);

      // Stage outputs present
      assert.ok(res.verification);
      assert.equal(typeof res.verification.isRealReport, 'boolean');
      assert.ok(res.understanding);
      assert.ok(res.entities);
      assert.equal(res.entities.district, 'Ranchi');
      assert.ok(res.research);

      // Prioritization consumed injected research bonuses -> high score + live confidence
      assert.equal(res.priority.confidence, 0.92);
      assert.equal(res.priority.modelVersion, 'nivaaran-live-v1');
      assert.ok(res.priority.priorityScore >= 70);

      // Match stage scored both universities
      assert.equal(res.matches.length, 2);
      assert.ok(res.matches.every((m: any) => typeof m.score === 'number'));

      assert.equal(res.status, 'COMPLETED');
      assert.equal(res.jobId, 'test-job-7a');
      assert.equal(res.challengeId, 'ch-7a');
    });

    it('should store the full result in matchResultsStore keyed by jobId', async () => {
      const { matchResultsStore } = await import('../src/core/workers/index');
      const payload = {
        challenge: { title: 'Pothole cluster on NH-33', category: 'Road', district: 'Hazaribagh', hazardUrgency: 5 },
        upvotes: 2,
        researchResult: { confidence: 0.6 },
        universities: [],
      };

      await runAIPipeline(payload, 'stored-job-1', 'ch-stored');
      const stored = matchResultsStore.get('stored-job-1');

      assert.ok(stored);
      assert.equal(stored.jobId, 'stored-job-1');
      assert.deepEqual(stored.pipeline, ['verify', 'understand', 'research', 'prioritize', 'match']);
      assert.equal(stored.priority.modelVersion, 'nivaaran-fallback-v1'); // 0.6 confidence
    });
  });
});
