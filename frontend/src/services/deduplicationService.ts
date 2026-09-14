/**
 * NIVAARAN — 4-Stage Deduplication Engine (SIH 26043)
 * Stage 4: Challenge Clustering & Deduplication Gate
 *
 * 4-Stage pipeline (user-specified):
 *   Stage 1 — District (hard gate): both must be in the same district.
 *   Stage 2 — Village / Block match.
 *   Stage 3 — GPS within 500m radius.
 *   Stage 4 — Keyword overlap.
 *
 * Scoring:
 *   Location component = 50% of total  (village 25% + GPS 25%)
 *   Keyword component  = 50% of total
 *   Duplicate threshold ≥ 0.75
 *
 * When geolocation is denied by the user, the system falls back to the
 * centroid of the selected district (DISTRICT_CENTROIDS map below).
 */

import { workflowStore } from './workflowStore';
import type { Challenge, RiskLevel } from './workflowTypes';

// ── DISTRICT CENTROID MAP ────────────────────────────────────────────────
// Used as GPS fallback when the user denies geolocation. Instead of null
// (which breaks GPS-based scoring), we substitute the centroid of the
// selected district so Stage 3 (GPS proximity) can still function.
const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'ranchi':                     { lat: 23.3441, lng: 85.3096 },
  'dhanbad':                    { lat: 23.7957, lng: 86.4304 },
  'east singhbhum':             { lat: 22.8046, lng: 86.2029 },
  'east singhbhum (jamshedpur)':{ lat: 22.8046, lng: 86.2029 },
  'bokaro':                     { lat: 23.6693, lng: 86.1511 },
  'palamu':                     { lat: 24.0167, lng: 84.0667 },
  'hazaribagh':                 { lat: 23.9928, lng: 85.3611 },
  'deoghar':                    { lat: 24.4764, lng: 86.6947 },
  'giridih':                    { lat: 24.1896, lng: 86.2996 },
  'ramgarh':                    { lat: 24.1840, lng: 85.6050 },
  'latehar':                    { lat: 23.6693, lng: 84.5000 },
  'garhwa':                     { lat: 24.1840, lng: 83.8140 },
  'dumka':                      { lat: 24.2644, lng: 87.2418 },
  'godda':                      { lat: 24.8250, lng: 87.2144 },
  'sahibganj':                  { lat: 25.2492, lng: 87.6492 },
  'pakur':                      { lat: 24.6300, lng: 87.8400 },
  'jamtara':                    { lat: 23.9610, lng: 86.8600 },
  'khunti':                     { lat: 23.0726, lng: 85.2800 },
  'gumla':                      { lat: 23.0726, lng: 84.5400 },
  'simdega':                    { lat: 22.6167, lng: 84.5167 },
  'west singhbhum':             { lat: 22.3550, lng: 85.2500 },
  'saraikela kharsawan':        { lat: 22.6960, lng: 85.8260 },
  'chatra':                     { lat: 24.2068, lng: 84.8732 },
  'koderma':                    { lat: 24.4680, lng: 85.5340 },
  'lohardaga':                  { lat: 23.4322, lng: 84.6800 },
};

/**
 * Return the centroid coordinates for a Jharkhand district.
 * Used as GPS fallback when the citizen denies browser geolocation.
 */
export function getDistrictCentroid(district: string): { lat: number; lng: number } | null {
  return DISTRICT_CENTROIDS[district.toLowerCase().trim()] || null;
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  clusterId: string | null;
  similarChallenges: Challenge[];
  similarityScore: number;
  primaryChallenge: Challenge | null;
  matchReason?: string;
}

export interface MergeReportInput {
  title?: string;
  description?: string;
  evidenceUrls?: string[];
  submittedBy?: string;
  submittedByRole?: string;
  locationCoords?: { lat: number; lng: number };
  formattedAddress?: string;
  village?: string;
  block?: string;
  district?: string;
}

export interface MergeResult {
  success: boolean;
  primaryChallenge?: Challenge;
  newReportCount: number;
  newPriorityScore: number;
  newRiskLevel: RiskLevel;
}

// Cluster ID prefix for challenges in the same group
const CLUSTER_PREFIX = 'CLUSTER-';

/**
 * Main entry point: check a new submission against existing challenges
 */
export function findSimilarChallenges(
  newChallenge: Partial<Challenge>
): DeduplicationResult {
  const existingChallenges = workflowStore.getChallenges();

  // Get active challenges for comparison
  const candidateChallenges = existingChallenges.filter(
    c => c.id !== newChallenge.id && c.id !== newChallenge.reportId && c.status !== 'Rejected' && c.status !== 'Closed'
  );

  if (candidateChallenges.length === 0) {
    return {
      isDuplicate: false,
      clusterId: null,
      similarChallenges: [],
      similarityScore: 0,
      primaryChallenge: null,
    };
  }

  const scoredMatches = candidateChallenges.map(existing => ({
    challenge: existing,
    score: calculateSimilarityScore(newChallenge, existing),
  }));

  // Sort by score descending
  scoredMatches.sort((a, b) => b.score - a.score);

  const bestMatch = scoredMatches[0];
  // STAGE 5: DECISION — 4-stage scores fall on [0,1]. The user-defined rule:
  // two problems are duplicates ONLY when same district, same village/block,
  // coords within ~500m, and at least half of keywords match. That composite
  // works out to a threshold of 0.75. Below 0.50 (truly dissimilar district /
  // keyword overlap) there is nothing worth flagging to the citizen at all.
  const SCORE_TOO_LOW = 0.50; // No worthwhile signal below this — return not-duplicate.
  const DUP_THRESHOLD = 0.75; // >= 0.75 = same problem (the user's rule).

  if (!bestMatch || bestMatch.score < SCORE_TOO_LOW) {
    return {
      isDuplicate: false,
      clusterId: null,
      similarChallenges: [],
      similarityScore: bestMatch?.score || 0,
      primaryChallenge: null,
    };
  }

  // 0.50–0.75: some shared signal (same district + partial keyword match) but
  // NOT enough to call them the same problem — surface as "similar" only.
  const isDuplicate = bestMatch.score >= DUP_THRESHOLD;
  const existingClusterId = bestMatch.challenge.clusterId || `${CLUSTER_PREFIX}${bestMatch.challenge.reportId || bestMatch.challenge.id}`;

  const clusterMembers = candidateChallenges.filter(
    c => c.clusterId === existingClusterId || c.id === bestMatch.challenge.id
  );

  const matchReason = isDuplicate
    ? `Matches existing incident in ${bestMatch.challenge.district} (${Math.round(bestMatch.score * 100)}% similarity)`
    : `Related incident in cluster ${existingClusterId}`;

  return {
    isDuplicate,
    clusterId: existingClusterId,
    similarChallenges: [bestMatch.challenge, ...clusterMembers.filter(c => c.id !== bestMatch.challenge.id)],
    similarityScore: bestMatch.score,
    primaryChallenge: bestMatch.challenge,
    matchReason,
  };
}

/**
 * Auto-Merge: Merges a duplicate citizen report into the original primary issue.
 * Increments report count, appends photos, boosts priority score, and logs audit timeline.
 */
export async function mergeWithPrimaryChallenge(
  primaryChallengeId: string,
  newReport: MergeReportInput
): Promise<MergeResult> {
  const primary = workflowStore.getChallenge(primaryChallengeId);
  if (!primary) {
    return {
      success: false,
      newReportCount: 1,
      newPriorityScore: 50,
      newRiskLevel: 'MEDIUM',
    };
  }

  const updatedReportCount = (primary.citizenReportCount || 1) + 1;
  const updatedUpvotes = (primary.communityUpvotes || 0) + 1;

  // Append new photo evidence (avoid duplicates)
  const currentUrls = primary.evidenceUrls || [];
  const newUrls = (newReport.evidenceUrls || []).filter(u => u && !currentUrls.includes(u));
  const mergedEvidence = [...currentUrls, ...newUrls];

  // Dynamic priority boost based on citizen volume (+3 pts per duplicate report, capped at 100)
  const currentScore = primary.priorityScore || 60;
  const boostedPriority = Math.min(100, currentScore + 3);

  let newRiskLevel: RiskLevel = primary.riskLevel || 'MEDIUM';
  if (boostedPriority >= 85) newRiskLevel = 'CRITICAL';
  else if (boostedPriority >= 70) newRiskLevel = 'HIGH';
  else if (boostedPriority >= 50) newRiskLevel = 'MEDIUM';

  const clusterId = primary.clusterId || `${CLUSTER_PREFIX}${primary.reportId || primary.id}`;

  const now = new Date().toISOString();
  const citizenLoc = newReport.village || newReport.block || newReport.formattedAddress || 'Nearby citizen';

  // 1. Update primary challenge in workflow store
  const updatedChallenge = await workflowStore.updateChallenge(primary.id, {
    citizenReportCount: updatedReportCount,
    communityUpvotes: updatedUpvotes,
    evidenceUrls: mergedEvidence,
    priorityScore: boostedPriority,
    riskLevel: newRiskLevel,
    clusterId,
    updatedAt: now,
  });

  // 2. Add an audit timeline event
  workflowStore.addTimelineEvent({
    id: `TL-${Date.now()}-merge`,
    entityType: 'challenge',
    entityId: primary.id,
    action: 'report_boosted',
    actor: 'Citizen Network',
    actorRole: 'Citizen',
    description: `Additional citizen report & photographic evidence submitted from ${citizenLoc}. Consolidated reports: ${updatedReportCount} citizens affected. Priority boosted to ${boostedPriority}/100 [${newRiskLevel}].`,
    previousValue: `${currentScore}/100 (${updatedReportCount - 1} reports)`,
    newValue: `${boostedPriority}/100 (${updatedReportCount} reports)`,
    timestamp: now,
  });

  // 3. Background sync to backend / Firestore
  (async () => {
    try {
      const { apiClient } = await import('../api/client');
      await apiClient.transitionChallenge(primary.id, 'Citizen Report Boosted', {
        citizenReportCount: updatedReportCount,
        communityUpvotes: updatedUpvotes,
        priorityScore: boostedPriority,
        riskLevel: newRiskLevel,
      });
    } catch {
      // Local state is already updated
    }
  })();

  return {
    success: true,
    primaryChallenge: updatedChallenge || primary,
    newReportCount: updatedReportCount,
    newPriorityScore: boostedPriority,
    newRiskLevel,
  };
}

/**
 * 4-Stage Similarity Scoring (user-specified spec):
 *   Stage 1 — District: hard gate. Different districts → 0.0.
 *   Stage 2 — Village/Block match: same block/village → +25%
 *   Stage 3 — GPS proximity: within 500m → up to +25%
 *   Stage 4 — Keyword overlap: Jaccard-like → up to +50%
 *   Duplicate threshold: ≥ 0.75
 *
 * When GPS is unavailable (user denied geolocation), the centroid of the
 * selected district is substituted so Stage 3 still functions.
 */
export function calculateSimilarityScore(
  a: Partial<Challenge>,
  b: Challenge
): number {
  // ── STAGE 1: DISTRICT HARD GATE ─────────────────────────────────────
  const distA = (a.district || '').toLowerCase().trim();
  const distB = (b.district || '').toLowerCase().trim();
  if (!distA || !distB) return 0;
  if (distA !== distB) return 0.0; // different district → never a duplicate

  // ── STAGE 2 + 3: LOCATION = 50% (village 25% + GPS 25%), REQUIRED TOGETHER ─
  // Both signals must co-firm: same village/block AND coords within ~500m.
  // Multiplicative AND, not additive — otherwise the user's rule is violated:
  // a report could reach 0.75 from "same village + full keyword" while its GPS
  // is 14km away, which is NOT a duplicate. GPS only overrides when real coords
  // exist; when either side lacks GPS (geolocation denied), the district-centroid
  // fallback or village text is used as the proximity proxy.
  const blockA = (a.block || a.village || '').toLowerCase().trim();
  const blockB = (b.block || b.village || '').toLowerCase().trim();
  const villageScore = (blockA && blockB && blockA === blockB) ? 1.0 : 0.0;

  const gpsA = a.locationCoords;
  const gpsB = b.locationCoords;
  const bothHaveGps = !!(gpsA && gpsB && gpsA.lat && gpsB.lat);

  let gpsScore: number;
  if (bothHaveGps) {
    // Hard radius gate: "within radius of 500 m" is a boolean condition.
    const distM = calculateHaversineDistanceKm(gpsA.lat, gpsA.lng, gpsB.lat, gpsB.lng) * 1000;
    gpsScore = distM <= 500 ? 1.0 : 0.0;
  } else {
    // One/both missing real GPS (denied/timeout): the report is anchored to the
    // district centroid. Same village is our only proximity signal — assume
    // close when villages match, otherwise unknown (score 0).
    gpsScore = villageScore;
  }

  // Location contributes 50% and requires village AND gps to co-fire.
  const locationScore = 0.50 * villageScore * gpsScore;

  // ── STAGE 4: KEYWORD OVERLAP (50%) ───────────────────────────────────
  const keywordScore = calculateKeywordScore(a, b);
  const keywordComponent = keywordScore * 0.50;

  return locationScore + keywordComponent;
}

/**
 * Keyword overlap: compare title + description words with fuzzy and substring matching
 */
function calculateKeywordScore(a: Partial<Challenge>, b: Challenge): number {
  const textA = `${a.title || ''} ${a.description || ''}`.toLowerCase().trim();
  const textB = `${b.title || ''} ${b.description || ''}`.toLowerCase().trim();
  const titleA = (a.title || '').toLowerCase().trim();
  const titleB = (b.title || '').toLowerCase().trim();

  if (!titleA || !titleB) return 0;

  // Exact or Substring match on titles
  if (titleA === titleB) return 1.0;
  if (titleA.includes(titleB) || titleB.includes(titleA)) return 0.95;

  // Prefix match (e.g. "testing" vs "testing2" vs "testinq")
  if (titleA.length >= 4 && titleB.length >= 4) {
    const minLen = Math.min(titleA.length, titleB.length, 6);
    if (titleA.slice(0, minLen) === titleB.slice(0, minLen)) return 0.90;
    if (titleA.slice(0, 4) === titleB.slice(0, 4)) return 0.85;
  }

  // Cross text inclusion
  if (textA.includes(titleB) || textB.includes(titleA)) return 0.90;

  const wordsA = new Set(extractKeywords(textA));
  const wordsB = new Set(extractKeywords(textB));

  if (wordsA.size === 0 || wordsB.size === 0) {
    return textA.includes(textB) || textB.includes(textA) ? 0.85 : 0;
  }

  // Cross-word containment, gated by length ratio: only count as a match when
  // one term is essentially a variant/prefix of the other (>=60% of its length).
  // This fixes the old bug where the short token "water" matched "waterlogging",
  // "waterworks", "water scarcity", etc. making a generic word overlap with any
  // water-related report. Purely partial overlaps ("water" ⊂ "watershed") no
  // longer count unless the tokens genuinely share most of their characters.
  const intersection = [...wordsA].filter(w =>
    wordsB.has(w) || [...wordsB].some(bw => {
      const short = w.length <= bw.length ? w : bw;
      const long = w.length <= bw.length ? bw : w;
      return long.includes(short) && short.length / long.length >= 0.6;
    })
  );
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.length / Math.max(1, union.size);
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'i', 'we', 'they', 'he', 'she',
    'it', 'my', 'our', 'their', 'its', 'very', 'more', 'most', 'some',
    'any', 'no', 'not', 'only', 'just', 'also', 'than', 'then', 'now',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'other', 'such', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out',
    'off', 'over', 'under', 'again', 'further', 'once', 'issue', 'problem'
  ]);

  return text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word.toLowerCase()));
}

/**
 * Haversine formula: calculate distance in kilometers between two GPS coordinates
 */
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Assign a challenge to a cluster
 */
export async function assignToCluster(
  challengeId: string,
  clusterId: string
): Promise<Challenge | undefined> {
  return await workflowStore.updateChallenge(challengeId, {
    clusterId,
    status: 'Clustered',
  } as any);
}

/**
 * Get cluster info for display
 */
export function getClusterInfo(clusterId: string): {
  count: number;
  primaryChallenge: Challenge | undefined;
  members: Challenge[];
} {
  const allChallenges = workflowStore.getChallenges();
  const members = allChallenges.filter(c => c.clusterId === clusterId);
  const primaryChallenge = members.find(c => c.status === 'Government Validated') || members[0];

  return {
    count: members.length,
    primaryChallenge,
    members,
  };
}