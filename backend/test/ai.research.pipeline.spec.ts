import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractEntities, extractEntitiesHeuristic } from '../src/modules/ai/entityExtractor';
import { searchNews, parseAndFilterArticles, applyMergeRules } from '../src/modules/ai/newsEngine';
import { parseWeatherResponse, packageDisasterResult } from '../src/modules/ai/weatherParser';
import { getDistrictCoords, searchWeather } from '../src/modules/ai/weatherEngine';
import { searchGovtBulletins, researchProblem } from '../src/modules/ai/internetResearch';
import { scorePriority, classifyTriageTier } from '../src/modules/ai/AIProvider';

describe('AI Research & Entity Extraction 5-Step Pipeline (SIH 26043)', () => {
  // ── STEP 1: ENTITY EXTRACTION ──────────────────────────────────────────────
  describe('Step 1 — Extract Inputs from Report', () => {
    it('should extract structured entities with all 10 required fields and district coords', async () => {
      const report = {
        title: 'Severe culvert blockage and waterlogging in Harmu, Ranchi',
        description: 'Heavy flood water entering 200 homes near Harmu bypass, affecting over 1500 residents. Danger of electrical short circuit.',
        district: 'Ranchi',
        block: 'Harmu',
        eventDate: '2026-09-09',
        eventTime: '14:30',
        severity: 'HIGH',
        urgency: 8,
        affectedPopulation: 1500,
        upvotes: 12,
        economicValue: 250000,
      };

      const entities = await extractEntities(report);

      assert.equal(entities.district, 'Ranchi');
      assert.equal(entities.eventDate, '2026-09-09');
      assert.equal(entities.eventTime, '14:30');
      assert.ok(['Drainage', 'Water'].includes(entities.infrastructureType));
      assert.ok(['Flood', 'Waterlogging', 'Fire'].includes(entities.hazardType));
      assert.ok(['CRITICAL', 'HIGH'].includes(entities.severity));
      assert.ok(entities.urgency >= 7);
      assert.equal(entities.affectedPopulation, 1500);
      assert.equal(entities.upvotes, 12);
      assert.equal(entities.economicValue, 250000);
      assert.ok(entities.location.lat > 20 && entities.location.lng > 80);
    });

    it('heuristic extractor should accurately infer missing fields from raw text', () => {
      const rawText = 'Dangerous road pothole and landslide in Dhanbad Katras belt disrupting 800 villagers';
      const entities = extractEntitiesHeuristic(rawText);

      assert.equal(entities.district, 'Dhanbad');
      assert.equal(entities.infrastructureType, 'Road');
      assert.equal(entities.hazardType, 'Landslide');
      assert.ok(entities.affectedPopulation >= 500);
      assert.ok(entities.location.lat === 23.7957 || entities.location.lat === 23.80);
    });
  });

  // ── STEP 2: NEWS RESEARCH ──────────────────────────────────────────────────
  describe('Step 2 — News Research Engine', () => {
    it('should parse articles, filter within ±3 days, deduplicate by URL and cap at 3', async () => {
      const mockArticles = {
        articles: [
          {
            title: 'Waterlogging strikes Ranchi roads',
            source: { name: 'Prabhat Khabar' },
            url: 'https://news.example.com/1',
            description: 'Heavy rain causes flash waterlogging',
            publishedAt: '2026-09-08T10:00:00Z', // Within -1 day
          },
          {
            title: 'Waterlogging strikes Ranchi roads (Duplicate)',
            source: { name: 'Prabhat Khabar' },
            url: 'https://news.example.com/1', // duplicate URL
            description: 'Duplicate story',
            publishedAt: '2026-09-08T10:00:00Z',
          },
          {
            title: 'Culvert choke in Harmu',
            source: { name: 'Dainik Jagran' },
            url: 'https://news.example.com/2',
            description: 'Choked culvert in ward 23',
            publishedAt: '2026-09-10T12:00:00Z', // Within +1 day
          },
          {
            title: 'Old incident from 2 weeks ago',
            source: { name: 'Ranchi Times' },
            url: 'https://news.example.com/3',
            description: 'Old news',
            publishedAt: '2026-08-15T00:00:00Z', // Outside ±3 days
          },
          {
            title: 'Fourth recent incident',
            source: { name: 'News 4' },
            url: 'https://news.example.com/4',
            description: 'Another incident',
            publishedAt: '2026-09-09T00:00:00Z',
          },
          {
            title: 'Fifth incident',
            source: { name: 'News 5' },
            url: 'https://news.example.com/5',
            description: 'Fifth one',
            publishedAt: '2026-09-09T00:00:00Z',
          },
        ],
      };

      const result = await parseAndFilterArticles(mockArticles, '2026-09-09', 'Ranchi Drainage Waterlogging', 'GNews');

      assert.equal(result.corroborationCount, 6);
      assert.ok(result.recentIncidents.length <= 3, 'Must be capped at max 3');
      assert.equal(result.recentIncidents.length, 3);
      assert.equal(result.confidence, 0.92);
      // Ensure duplicate URL and old article were omitted
      const urls = result.recentIncidents.map(i => i.url);
      assert.ok(!urls.includes('https://news.example.com/3'), 'Old article should be filtered out');
      assert.equal(new Set(urls).size, urls.length, 'All URLs must be unique');
    });

    it('should return empty incidents and confidence 0 when API returns empty or fails', async () => {
      const result = await parseAndFilterArticles({ articles: [] }, '2026-09-09', 'Ranchi', 'none');
      assert.equal(result.recentIncidents.length, 0);
      assert.equal(result.corroborationCount, 0);
      assert.equal(result.confidence, 0);
    });
  });

  // ── STEP 3: DISASTER / WEATHER RESEARCH ─────────────────────────────────────
  describe('Step 3 — Disaster & Weather Research (Open-Meteo)', () => {
    it('should map district coords accurately for Jharkhand districts', () => {
      const ranchi = getDistrictCoords('Ranchi');
      assert.equal(ranchi.lat, 23.34);
      assert.equal(ranchi.lng, 85.32);

      const dhanbad = getDistrictCoords('Dhanbad');
      assert.equal(dhanbad.lat, 23.80);
      assert.equal(dhanbad.lng, 86.45);
    });

    it('should detect active weather alerts when rain > 20mm or storm code >= 95', () => {
      const mockWeather = {
        daily: {
          time: ['2026-09-08', '2026-09-09', '2026-09-10'],
          rain_sum: [5.2, 34.8, 1.0], // 34.8 > 20mm
          weather_code: [3, 95, 2],    // 95 = Thunderstorm
        },
      };

      const parsed = parseWeatherResponse(mockWeather, '2026-09-09');
      assert.equal(parsed.activeAlert, true);
      assert.equal(parsed.severityLevel, 'high');
      assert.equal(parsed.maxRain, 34.8);
      assert.equal(parsed.stormDetected, true);
      assert.ok(parsed.matchedDates.includes('2026-09-09'));

      const packaged = packageDisasterResult(parsed, true);
      assert.equal(packaged.source, 'disaster-live');
      assert.equal(packaged.confidence, 0.92);
      assert.equal(packaged.activeAlert, true);
    });

    it('should return activeAlert=false when rain <= 20mm and no storm code', () => {
      const calmWeather = {
        daily: {
          time: ['2026-09-08', '2026-09-09', '2026-09-10'],
          rain_sum: [0.0, 2.4, 0.0],
          weather_code: [1, 2, 1],
        },
      };

      const parsed = parseWeatherResponse(calmWeather, '2026-09-09');
      assert.equal(parsed.activeAlert, false);
      assert.equal(parsed.severityLevel, 'low');
      assert.equal(parsed.stormDetected, false);
    });
  });

  // ── STEP 4: GOVERNMENT / BULLETIN RESEARCH ──────────────────────────────────
  describe('Step 4 — Government & Regional Hazard Bulletins', () => {
    it('should query regional DB advisories and mark source db or live with proper tags', async () => {
      const govtRes = await searchGovtBulletins('Ranchi', 'Waterlogging', 2);

      assert.ok(govtRes.governmentAdvisories.length > 0);
      assert.ok(govtRes.governmentAdvisories.some(a => a.startsWith('[db]') || a.startsWith('[live]')));
      assert.equal(typeof govtRes.recurringHazard, 'boolean');
      assert.ok(govtRes.confidence >= 0.60);
      assert.ok(govtRes.severityContext.length > 10);
    });
  });

  // ── STEP 5: MERGE / COMBINE RESULTS & PRIORITY SCORING ─────────────────────
  describe('Step 5 — Unified Merge Rules & Priority Integration', () => {
    it('should apply stepped confidence rules (0.92 / 0.85 / 0.70 / 0.60)', () => {
      // All 3 sources active
      const all3 = applyMergeRules({
        news: { recentIncidents: [{ title: 'A', source: 'N', url: 'u1', snippet: 's', publishedAt: '2026-09-09' }], corroborationCount: 2, confidence: 0.92 },
        disaster: { activeAlert: true, severityLevel: 'high', maxRain: 25, confidence: 0.92, source: 'disaster-live' },
        govt: { governmentAdvisories: ['[live] DDG advisory'], source: 'govt-live', confidence: 0.85 },
        queryUsed: 'Ranchi test',
      });
      assert.equal(all3.confidence, 0.92);
      assert.ok(all3.severityContext.includes('CORROBORATED RISK'));

      // 2 sources active
      const twoSources = applyMergeRules({
        news: { recentIncidents: [{ title: 'A', source: 'N', url: 'u1', snippet: 's', publishedAt: '2026-09-09' }], corroborationCount: 1, confidence: 0.92 },
        disaster: { activeAlert: false, severityLevel: 'low', maxRain: 2, confidence: 0.92, source: 'disaster-live' },
        govt: { governmentAdvisories: ['[db] RMC advisory'], source: 'govt-db', confidence: 0.60 },
        queryUsed: 'Ranchi test',
      });
      assert.equal(twoSources.confidence, 0.85);

      // DB only fallback
      const dbOnly = applyMergeRules({
        news: { recentIncidents: [], corroborationCount: 0, confidence: 0 },
        disaster: { activeAlert: false, severityLevel: 'none', maxRain: 0, confidence: 0, source: 'disaster-fallback' },
        govt: { governmentAdvisories: ['[db] RMC advisory'], source: 'govt-db', confidence: 0.60 },
        queryUsed: 'Ranchi test',
      });
      assert.equal(dbOnly.confidence, 0.60);
      assert.ok(dbOnly.severityContext.includes('Localized incident detected'));
    });

    it('end-to-end researchProblem should orchestrate all steps into UnifiedResearchResult and feed Priority Scorer', async () => {
      const entities = {
        district: 'Ranchi',
        infrastructureType: 'Drainage',
        hazardType: 'Waterlogging',
        eventDate: '2026-09-09',
        eventTime: '15:00',
        severity: 'CRITICAL' as const,
        urgency: 9,
        affectedPopulation: 2000,
        upvotes: 18,
        economicValue: 300000,
      };

      const research = await researchProblem(entities);

      assert.ok(research);
      assert.ok(Array.isArray(research.advisories));
      assert.ok(Array.isArray(research.incidents));
      assert.equal(typeof research.recurringHazard, 'boolean');
      assert.ok(research.confidence >= 0.60);

      // Feed into Priority Scorer (shared threshold formula: pop 2000→19+2=21, econ 300k→19, cost null→19, urg 9→25 + bonus)
      const priority = scorePriority(
        {
          ...entities,
          hazardUrgency: entities.urgency,
          severity: entities.severity,
          economicValue: entities.economicValue,
        },
        { recurrence: research.recurringHazard ? 15 : 5 },
        entities.upvotes
      );

      assert.ok(priority.priorityScore >= 70);
      assert.equal(priority.riskLevel, 'CRITICAL');
      assert.equal(priority.factors.populationImpact.score, 21);
    });
  });

  // ── STEP 6A: 4-PILLAR SCORING WITH DYNAMIC RESEARCH BONUSES ────────────────
  describe('Step 6A — 4-Pillar Scoring Logic with Dynamic Research Bonuses', () => {
    it('should calculate accurate base values and strictly clamp factors to [5, 25]', () => {
      // Shared threshold formula: pop 50→14 (min bucket), econ 10k→15 (min bucket),
      // cost 1M→17 (multi-phase), urg 1→13 (lowest bucket) = 59 MEDIUM.
      // The old continuous formula produced (5,5,5,5)=20 STANDARD — that formula is now retired.
      const lowChallenge = {
        affectedPopulation: 50,
        upvotes: 0,
        economicValue: 10000,
        severity: 'STANDARD',
        hazardUrgency: 1,
        estimatedCost: 1000000, // 1M → 17 (High Capital tier)
      };

      const result = scorePriority(lowChallenge, undefined, 0);

      assert.equal(result.factors.populationImpact.score, 14);
      assert.equal(result.factors.economicLifeSaving.score, 15);
      assert.equal(result.factors.resolutionCostFeasibility.score, 17);
      assert.equal(result.factors.hazardUrgency.score, 13);

      assert.equal(result.priorityScore, 59);
      assert.equal(result.riskLevel, 'MEDIUM');
    });

    it('should apply structured bonuses correctly from ResearchResult', () => {
      // Shared threshold formula fixtures (not the old continuous formula):
      //  pop 400→17+2(upvote)=19, econ 100k→15, cost 150k→21, urg 6→18 → base 73
      //  research: active+3, recurring+2, corroboration3+3 → total 81 HIGH
      const challenge = {
        affectedPopulation: 400,
        upvotes: 4,
        economicValue: 100000,
        severity: 'HIGH',
        hazardUrgency: 6,
        estimatedCost: 150000,
      };

      const researchResult = {
        activeAlert: true,                        // +3
        recurringHazardIdentified: true,          // +2
        corroborationCount: 3,                    // +3
      };

      const result = scorePriority(challenge, undefined, 4, researchResult);

      assert.equal(result.factors.populationImpact.score, 19);      // 17 + 2
      assert.equal(result.factors.economicLifeSaving.score, 15);    // threshold bucket
      assert.equal(result.factors.resolutionCostFeasibility.score, 21); // 150k → 21
      assert.equal(result.factors.hazardUrgency.score, 18);         // 6/10 → 18

      // Total = 73 base + 8 bonus = 81 HIGH
      assert.equal(result.priorityScore, 81);
      assert.equal(result.riskLevel, 'HIGH');
      assert.ok(result >= 70, 'Dual-nature number should support comparison');
    });
  });

  // ── STEP 6B: COMPOSITE PRIORITY SCORE & GOVERNANCE TRIAGE TIERS ───────────
  describe('Step 6B — Composite Priority Score & Governance Triage Tiers', () => {
    it('should correctly classify into all 4 standardized triage tiers and provide governance actions', () => {
      // 1. CRITICAL: >= 85
      const criticalResult = classifyTriageTier(90);
      assert.equal(criticalResult.riskLevel, 'CRITICAL');
      assert.equal(criticalResult.action, 'Immediate engineering / emergency dispatch');
      assert.equal(criticalResult.triageMetadata.tier, 'CRITICAL');

      // 2. HIGH: 70 - 84
      const highResult = classifyTriageTier(75);
      assert.equal(highResult.riskLevel, 'HIGH');
      assert.equal(highResult.action, 'Priority university R&D / municipal tasking');
      assert.equal(highResult.triageMetadata.tier, 'HIGH');

      // 3. MEDIUM: 50 - 69
      const mediumResult = classifyTriageTier(58);
      assert.equal(mediumResult.riskLevel, 'MEDIUM');
      assert.equal(mediumResult.action, 'Scheduled municipal intervention');
      assert.equal(mediumResult.triageMetadata.tier, 'MEDIUM');

      // 4. STANDARD: < 50
      const standardResult = classifyTriageTier(38);
      assert.equal(standardResult.riskLevel, 'STANDARD');
      assert.equal(standardResult.action, 'Routine civic maintenance');
      assert.equal(standardResult.triageMetadata.tier, 'STANDARD');
    });

    it('should accurately evaluate tier boundary thresholds', () => {
      assert.equal(classifyTriageTier(85).riskLevel, 'CRITICAL');
      assert.equal(classifyTriageTier(84).riskLevel, 'HIGH');
      assert.equal(classifyTriageTier(70).riskLevel, 'HIGH');
      assert.equal(classifyTriageTier(69).riskLevel, 'MEDIUM');
      assert.equal(classifyTriageTier(50).riskLevel, 'MEDIUM');
      assert.equal(classifyTriageTier(49).riskLevel, 'STANDARD');
    });

    it('should automatically escalate triage tiers when active weather alerts or recurring hazards occur', () => {
      // Shared threshold fixture that sits in MEDIUM before bonuses:
      //  pop 300→17+1=18, econ 80k→15, cost 2M→17, urg 6→18 → base 68 MEDIUM
      //  + activeAlert 3 + recurring 2 + corroboration 2 = +7 → 75 HIGH (escalated)
      const borderlineChallenge = {
        affectedPopulation: 300,
        upvotes: 2,
        economicValue: 80000,
        severity: 'MEDIUM',
        hazardUrgency: 6,
        estimatedCost: 2000000,
      };

      const baseResult = scorePriority(borderlineChallenge, undefined, 2);
      assert.equal(baseResult.priorityScore, 68);
      assert.equal(baseResult.riskLevel, 'MEDIUM');
      assert.equal(baseResult.triageAction, 'Scheduled municipal intervention');

      const escalatedResearch = {
        activeAlert: true,                        // +3
        recurringHazardIdentified: true,          // +2
        corroborationCount: 2,                    // +2
      };

      const escalatedResult = scorePriority(borderlineChallenge, undefined, 2, escalatedResearch);
      assert.equal(escalatedResult.priorityScore, 75);
      assert.equal(escalatedResult.riskLevel, 'HIGH');
      assert.equal(escalatedResult.triageAction, 'Priority university R&D / municipal tasking');
      assert.equal(escalatedResult.triageMetadata.escalatedByWeather, true);
      assert.equal(escalatedResult.triageMetadata.escalatedByRecurringHazard, true);
    });
  });

  // ── STEP 6C: RESPONSE ASSEMBLY & CONFIDENCE PROPAGATION ────────────────────
  describe('Step 6C — Response Assembly & Confidence Propagation', () => {
    it('should propagate live research confidence and set modelVersion to nivaaran-live-v1 (>= 0.85)', () => {
      // T5.1: all four numerics supplied — a missing cost would otherwise apply a
      // -0.08 honesty penalty and mask the research-confidence pass-through.
      const challenge = {
        affectedPopulation: 600,
        economicValue: 120000,
        hazardUrgency: 7,
        estimatedCost: 300000,
      };

      // 3 live sources -> confidence 0.92
      const liveResearch3 = {
        confidence: 0.92,
        activeAlert: true,
        corroborationCount: 3,
      };

      const result3 = scorePriority(challenge, undefined, 5, liveResearch3);
      assert.equal(result3.confidence, 0.92);
      assert.equal(result3.modelVersion, 'nivaaran-live-v1');

      // 2 live sources -> confidence 0.85
      const liveResearch2 = {
        confidence: 0.85,
        activeAlert: false,
        corroborationCount: 1,
      };

      const result2 = scorePriority(challenge, undefined, 5, liveResearch2);
      assert.equal(result2.confidence, 0.85);
      assert.equal(result2.modelVersion, 'nivaaran-live-v1');
    });

    it('should propagate fallback confidence and set modelVersion to nivaaran-fallback-v1 (< 0.85)', () => {
      // T5.1: all four numerics supplied so no honesty penalty distorts the
      // research-confidence pass-through asserted below.
      const challenge = {
        affectedPopulation: 300,
        economicValue: 50000,
        hazardUrgency: 4,
        estimatedCost: 250000,
      };

      // 1 source -> confidence 0.70
      const singleSourceResearch = {
        confidence: 0.70,
      };
      const res1 = scorePriority(challenge, undefined, 2, singleSourceResearch);
      assert.equal(res1.confidence, 0.70);
      assert.equal(res1.modelVersion, 'nivaaran-fallback-v1');

      // DB only fallback -> confidence 0.60
      const dbOnlyResearch = {
        confidence: 0.60,
      };
      const resDb = scorePriority(challenge, undefined, 2, dbOnlyResearch);
      assert.equal(resDb.confidence, 0.60);
      assert.equal(resDb.modelVersion, 'nivaaran-fallback-v1');

      // Research absent -> default confidence 0.75
      const resNoResearch = scorePriority(challenge, undefined, 2);
      assert.equal(resNoResearch.confidence, 0.75);
      assert.equal(resNoResearch.modelVersion, 'nivaaran-fallback-v1');
    });

    it('should assemble complete priority object and serialize to JSON matching Prompt 6C schema', () => {
      // Same fixtures as the 6A bonus test (shared threshold formula)
      const challenge = {
        affectedPopulation: 400,
        upvotes: 4,
        economicValue: 100000,
        severity: 'HIGH',
        hazardUrgency: 6,
        estimatedCost: 150000,
      };

      const researchResult = {
        activeAlert: true,
        recurringHazardIdentified: true,
        corroborationCount: 3,
        confidence: 0.92,
      };

      const result = scorePriority(challenge, undefined, 4, researchResult);
      const json = JSON.parse(JSON.stringify(result));

      // Validate prompt 6C required fields (structured factors shape: {score, max, reason})
      assert.equal(typeof json.priorityScore, 'number');
      assert.equal(json.priorityScore, 81);
      assert.equal(json.factors.populationImpact.score, 19);
      assert.equal(json.factors.economicLifeSaving.score, 15);
      assert.equal(json.factors.resolutionCostFeasibility.score, 21);
      assert.equal(json.factors.hazardUrgency.score, 18);
      assert.equal(json.riskLevel, 'HIGH');
      assert.equal(json.confidence, 0.92);
      assert.equal(json.modelVersion, 'nivaaran-live-v1');
    });
  });
});
