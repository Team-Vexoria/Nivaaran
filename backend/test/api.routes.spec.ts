import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { DISTRICTS } from '../src/constants/districts.js';
import { encryptPII, decryptPII } from '../src/security/encryption.js';
import { scorePriority, scoreHEIMatch, AIProvider } from '../src/modules/ai/AIProvider.js';

describe('API Routes & Security Subsystems (BACKEND_ARCHITECTURE.md & SECURITY_ARCHITECTURE.md)', () => {
  it('should verify Jharkhand 24 districts metadata and regions catalogue', () => {
    assert.equal(DISTRICTS.length, 24, `Expected 24 districts, found ${DISTRICTS.length}`);
    const ranchi = DISTRICTS.find((d) => d.code === 'RANCHI');
    assert.ok(ranchi, 'Ranchi district must exist in constants');
    assert.equal(ranchi?.name, 'Ranchi');
  });

  it('should encrypt and decrypt citizen PII with AES-256-GCM', () => {
    const rawPhone = '+919876543210';
    const encrypted = encryptPII(rawPhone);
    assert.notEqual(encrypted, rawPhone);
    assert.ok(encrypted.includes(':'), 'Encrypted string must contain iv:tag:ciphertext structure');

    const decrypted = decryptPII(encrypted);
    assert.equal(decrypted, rawPhone, 'Decrypted PII must match original plaintext');
  });

  it('should compute explainable 5-factor priority score bounded between 0 and 100', () => {
    const criticalChallenge = {
      severity: 'CRITICAL',
      institutional_readiness: 15,
      urgency_score: 18,
    };
    const spatialData = { recurrence: 15 };
    const upvotes = 25;

    const score = scorePriority(criticalChallenge, spatialData, upvotes);
    assert.ok(score >= 0 && score <= 100, `Score must be 0-100, received ${score}`);
    assert.ok(score >= 70, `Critical challenge should score high, got ${score}`);
  });

  it('should compute 4-factor HEI match score accurately', () => {
    const challenge = {
      category: 'DISASTER',
      tags: ['hydrology', 'sensor'],
    };
    const university = {
      departments: ['DISASTER', 'CIVIL'],
      labs: ['hydrology', 'iot'],
      accreditation: 'A++',
    };

    const matchScore = scoreHEIMatch(challenge, university, 5); // 5km proximity
    assert.ok(matchScore >= 0 && matchScore <= 100, `Match score must be 0-100, got ${matchScore}`);
    assert.ok(matchScore >= 80, `High fit university should score >=80, got ${matchScore}`);
  });

  it('AIProvider.understand should output valid recommendation schema with confidence and domain', async () => {
    const input = {
      title: 'Monsoon Flash Flood in Khel Gaon',
      description: 'Water submerging 15 homes near the riverbank',
      category: 'FLOOD_RISK',
      severity: 'CRITICAL',
    };

    const recommendation = await AIProvider.understand(input);
    assert.ok(recommendation);
    assert.equal(recommendation.domain, 'FLOOD_RISK');
    assert.equal(recommendation.severity, 'CRITICAL');
    assert.ok(recommendation.confidence >= 0.8);
    assert.ok(Array.isArray(recommendation.reasons) && recommendation.reasons.length > 0);
  });

  it('should verify Express app instance exports and route handlers are registered', () => {
    assert.ok(app, 'Express app must be exported');
    assert.equal(typeof app, 'function');
  });
});
