/**
 * NIVAARAN — Semantic Deduplication & Auto-Merge Engine (SIH 26043)
 * Stage 4: Challenge Clustering & Deduplication Gate
 *
 * 1. Scores similarity between submitted challenges:
 *    - Keyword & text overlap (35%)
 *    - GPS Haversine distance & village/district proximity (30%)
 *    - Category & problem domain match (25%)
 *    - Recency bonus (10%)
 *
 * 2. Auto-Merge Pipeline:
 *    - When an identical/proximate issue is detected (score >= 0.70 or <1km same category),
 *      it consolidates into the original primary post:
 *      - Increments `citizenReportCount` on the primary challenge (+1 citizen report).
 *      - Increments `communityUpvotes`.
 *      - Appends new citizen photo evidence into `evidenceUrls`.
 *      - Dynamically boosts the priority score due to higher citizen volume.
 *      - Emits a timeline event logged for government officers & universities.
 */

import { workflowStore } from './workflowStore';
import type { Challenge, RiskLevel } from './workflowTypes';

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
  if (!bestMatch || bestMatch.score < 0.45) {
    return {
      isDuplicate: false,
      clusterId: null,
      similarChallenges: [],
      similarityScore: bestMatch?.score || 0,
      primaryChallenge: null,
    };
  }

  // Deduplication threshold: >= 0.70 is an exact duplicate/merge candidate
  const isDuplicate = bestMatch.score >= 0.70;
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
 * Calculate multi-dimensional similarity score (0 to 1 range)
 */
export function calculateSimilarityScore(
  a: Partial<Challenge>,
  b: Challenge
): number {
  // 1. Keyword & Title overlap (35%)
  const keywordScore = calculateKeywordScore(a, b);

  // 2. Geographic & GPS proximity (30%)
  const locationScore = calculateLocationScore(a, b);

  // 3. Category & Problem Domain match (25%)
  const categoryScore = calculateCategoryScore(a, b);

  // 4. Recency bonus (10%)
  const recencyScore = calculateRecencyScore(a, b);

  // Special immediate rule: Same exact category within <500 meters GPS = 95% duplicate match
  if (categoryScore >= 0.9 && locationScore >= 0.95) {
    return 0.95;
  }

  return (keywordScore * 0.35) + (locationScore * 0.30) + (categoryScore * 0.25) + (recencyScore * 0.10);
}

/**
 * Keyword overlap: compare title + description words with Jaccard coefficient
 */
function calculateKeywordScore(a: Partial<Challenge>, b: Challenge): number {
  const textA = `${a.title || ''} ${a.description || ''}`.toLowerCase();
  const textB = `${b.title || ''} ${b.description || ''}`.toLowerCase();

  const wordsA = new Set(extractKeywords(textA));
  const wordsB = new Set(extractKeywords(textB));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.length / union.size;
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
 * Location proximity: computes GPS distance if coordinates exist, otherwise district/block/village matching
 */
function calculateLocationScore(a: Partial<Challenge>, b: Challenge): number {
  // 1. Precise GPS calculation if both have coordinates
  if (a.locationCoords && b.locationCoords && a.locationCoords.lat && b.locationCoords.lat) {
    const distKm = calculateHaversineDistanceKm(
      a.locationCoords.lat,
      a.locationCoords.lng,
      b.locationCoords.lat,
      b.locationCoords.lng
    );

    if (distKm <= 0.3) return 1.0;     // Within 300m = same exact spot
    if (distKm <= 1.0) return 0.90;    // Within 1km = same neighborhood / street
    if (distKm <= 3.0) return 0.75;    // Within 3km = same village / ward
    if (distKm <= 10.0) return 0.50;   // Within 10km = same block
    if (distKm <= 25.0) return 0.25;   // Same sub-district
    return 0.05;
  }

  // 2. Text-based hierarchy matching
  const districtA = (a.district || '').toLowerCase().trim();
  const districtB = (b.district || '').toLowerCase().trim();
  const villageA = (a.village || a.block || '').toLowerCase().trim();
  const villageB = (b.village || b.block || '').toLowerCase().trim();

  if (!districtA || !districtB) return 0;

  if (villageA && villageB && villageA === villageB && districtA === districtB) {
    return 1.0;
  }

  if (districtA === districtB) {
    const blockA = (a.block || '').toLowerCase().trim();
    const blockB = (b.block || '').toLowerCase().trim();
    if (blockA && blockB && blockA === blockB) {
      return 0.85;
    }
    return 0.70;
  }

  return 0;
}

/**
 * Category match: exact match = 1.0, related = 0.5, different = 0
 */
function calculateCategoryScore(a: Partial<Challenge>, b: Challenge): number {
  const catA = (a.category || '').toLowerCase().trim();
  const catB = (b.category || '').toLowerCase().trim();

  if (!catA || !catB) return 0;

  if (catA === catB) {
    return 1.0;
  }

  const wordsA = extractKeywords(catA);
  const wordsB = extractKeywords(catB);
  const overlap = wordsA.filter(w => wordsB.some(bw => bw.includes(w) || w.includes(bw)));

  if (overlap.length >= 2) {
    return 0.7;
  }
  if (overlap.length >= 1) {
    return 0.45;
  }

  return 0;
}

/**
 * Recency: more recent = higher score (challenges within 7 days get highest bonus)
 */
function calculateRecencyScore(a: Partial<Challenge>, b: Challenge): number {
  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
  const dateB = new Date(b.createdAt).getTime();

  const daysDiff = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 1) return 1.0;
  if (daysDiff <= 7) return 0.9;
  if (daysDiff <= 30) return 0.7;
  if (daysDiff <= 90) return 0.4;

  return 0.1;
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