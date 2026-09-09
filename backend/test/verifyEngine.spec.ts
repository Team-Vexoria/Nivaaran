import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure-function imports from verifyEngine (no Prisma / Gemini needed)
import { dedupHelpers, getVerificationStore } from '../src/modules/ai/verifyEngine';

describe('verifyEngine — Dedup Helpers & Text Heuristics (SIH 26043)', () => {
  // ── normalizeForDedup ──────────────────────────────────────────────────────
  describe('normalizeForDedup', () => {
    it('should produce a stable pipe-joined key from title|desc|district|category', () => {
      const key = dedupHelpers.normalizeForDedup({
        title: 'Waterlogging in Ranchi drain',
        description: 'Heavy rain caused blockage',
        district: 'Ranchi',
        category: 'Drainage',
      });
      assert.ok(key.includes('waterlogging in ranchi drain'));
      assert.ok(key.includes('heavy rain caused blockage'));
      assert.equal((key.match(/\|/g) || []).length, 3); // 4 fields joined by 3 pipes
    });

    it('should collapse internal whitespace runs to single spaces', () => {
      const key = dedupHelpers.normalizeForDedup({
        title: 'Waterlogging   in   Ranchi',
        description: 'Heavy  rain',
        district: 'Ranchi',
        category: 'Drainage',
      });
      assert.ok(!key.includes('  '), `expected no double spaces, got: ${JSON.stringify(key)}`);
    });

    it('should trim leading/trailing whitespace', () => {
      const key = dedupHelpers.normalizeForDedup({
        title: '  Broken streetlight  ',
        description: '  Near park  ',
        district: 'Ranchi',
        category: 'Street Light',
      });
      assert.ok(!key.startsWith(' '));
      assert.ok(!key.endsWith(' '));
    });

    it('should cap description at 180 chars to bound key size', () => {
      const longDesc = 'x'.repeat(400);
      const key = dedupHelpers.normalizeForDedup({
        title: 'T', description: longDesc, district: 'D', category: 'C',
      });
      const descPart = key.split('|')[1] || '';
      assert.ok(descPart.length <= 180);
    });

    it('should tolerate missing fields (empty-string defaults)', () => {
      const key = dedupHelpers.normalizeForDedup({ title: 'Pothole' });
      assert.ok(key.startsWith('pothole|'));
    });
  });

  // ── computeHash ────────────────────────────────────────────────────────────
  describe('computeHash', () => {
    it('should return a non-empty hex string', () => {
      const h = dedupHelpers.computeHash('hello world');
      assert.ok(typeof h === 'string');
      assert.ok(h.length > 0, 'hash should be non-empty');
      assert.ok(/^[0-9a-f]+$/.test(h), `expected hex-only chars, got: ${h}`);
    });

    it('should be deterministic', () => {
      const h1 = dedupHelpers.computeHash('same-input');
      const h2 = dedupHelpers.computeHash('same-input');
      assert.equal(h1, h2);
    });

    it('should produce different hashes for different inputs', () => {
      const h1 = dedupHelpers.computeHash('waterlogging ranchi');
      const h2 = dedupHelpers.computeHash('fire in dhanbad');
      assert.notEqual(h1, h2);
    });
  });

  // ── jaccardBigrams ─────────────────────────────────────────────────────────
  describe('jaccardBigrams', () => {
    it('should return 1.0 for identical strings', () => {
      assert.equal(dedupHelpers.jaccardBigrams('hello', 'hello'), 1.0);
    });

    it('should return 0.0 for strings shorter than 4 chars (guard clause)', () => {
      assert.equal(dedupHelpers.jaccardBigrams('ab', 'cd'), 0);
      assert.equal(dedupHelpers.jaccardBigrams('abc', 'hello world this is long'), 0);
    });

    it('should return >= 0.72 for near-duplicate titles', () => {
      const sim = dedupHelpers.jaccardBigrams(
        'waterlogging near ranchi drain bypass road',
        'water logging near ranchi drain bypass road',
      );
      assert.ok(sim >= 0.72, `Expected Jaccard >= 0.72 for near-duplicates, got ${sim.toFixed(3)}`);
    });

    it('should return low similarity for unrelated titles', () => {
      const sim = dedupHelpers.jaccardBigrams(
        'waterlogging near ranchi drain',
        'fire breakout in dhanbad coal mine',
      );
      assert.ok(sim < 0.50, `Expected low similarity for unrelated titles, got ${sim.toFixed(3)}`);
    });

    it('should handle empty strings gracefully', () => {
      // Identical strings (both empty) return 1 via the `a === b` early-return
      assert.equal(dedupHelpers.jaccardBigrams('', ''), 1);
      // One empty + one non-empty → length guard fires → 0
      assert.equal(dedupHelpers.jaccardBigrams('hello', ''), 0);
    });
  });

  // ── L1 in-memory store ─────────────────────────────────────────────────────
  describe('REPORT_STORE (L1 in-memory cache)', () => {
    it('should be a Map instance', () => {
      const store = getVerificationStore();
      assert.ok(store instanceof Map);
    });
  });
});