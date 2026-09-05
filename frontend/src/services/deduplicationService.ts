/**
 * NIVAARAN — Semantic Deduplication Engine (SIH 26043)
 * Stage 4: Challenge Clustering & Similarity Detection
 *
 * Scores similarity between submitted challenges to identify duplicates/clusters:
 * - Keyword overlap (40%)
 * - District/village proximity (25%)
 * - Category match (25%)
 * - Recency bonus (10%)
 *
 * Threshold: >= 65% = clustered as potential duplicate
 */

import { workflowStore } from './workflowStore';
import type { Challenge } from './workflowTypes';

export interface DeduplicationResult {
  isDuplicate: boolean;
  clusterId: string | null;
  similarChallenges: Challenge[];
  similarityScore: number;
  primaryChallenge: Challenge | null;
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

  // Get the most recent challenges for comparison (skip very old ones to save computation)
  const recentChallenges = existingChallenges
    .filter(c => c.id !== newChallenge.id && c.id !== newChallenge.reportId)
    .slice(0, 50); // Compare against last 50 for performance

  if (recentChallenges.length === 0) {
    return {
      isDuplicate: false,
      clusterId: null,
      similarChallenges: [],
      similarityScore: 0,
      primaryChallenge: null,
    };
  }

  const scoredMatches = recentChallenges.map(existing => ({
    challenge: existing,
    score: calculateSimilarityScore(newChallenge, existing),
  }));

  // Sort by score descending
  scoredMatches.sort((a, b) => b.score - a.score);

  const bestMatch = scoredMatches[0];
  const threshold = 0.65; // 65% similarity threshold

  if (bestMatch.score >= threshold) {
    // Find or create a cluster
    const existingClusterId = bestMatch.challenge.clusterId || `${CLUSTER_PREFIX}${bestMatch.challenge.id}`;

    // Get all challenges in this cluster
    const clusterMembers = existingChallenges.filter(
      c => c.clusterId === existingClusterId || c.id === bestMatch.challenge.id
    );

    return {
      isDuplicate: bestMatch.score >= 0.80, // Very high similarity = likely exact duplicate
      clusterId: existingClusterId,
      similarChallenges: [bestMatch.challenge, ...clusterMembers.filter(c => c.id !== bestMatch.challenge.id)],
      similarityScore: bestMatch.score,
      primaryChallenge: bestMatch.challenge,
    };
  }

  return {
    isDuplicate: false,
    clusterId: null,
    similarChallenges: [],
    similarityScore: bestMatch.score,
    primaryChallenge: null,
  };
}

/**
 * Calculate similarity score between two challenges (0-1 range)
 */
export function calculateSimilarityScore(
  a: Partial<Challenge>,
  b: Challenge
): number {
  // 1. Keyword overlap (40%)
  const keywordScore = calculateKeywordScore(a, b);

  // 2. District/village proximity (25%)
  const locationScore = calculateLocationScore(a, b);

  // 3. Category match (25%)
  const categoryScore = calculateCategoryScore(a, b);

  // 4. Recency bonus (10%)
  const recencyScore = calculateRecencyScore(a, b);

  return (keywordScore * 0.4) + (locationScore * 0.25) + (categoryScore * 0.25) + (recencyScore * 0.1);
}

/**
 * Keyword overlap: compare title + description words
 */
function calculateKeywordScore(a: Partial<Challenge>, b: Challenge): number {
  const textA = `${a.title || ''} ${a.description || ''}`.toLowerCase();
  const textB = `${b.title || ''} ${b.description || ''}`.toLowerCase();

  const wordsA = new Set(extractKeywords(textA));
  const wordsB = new Set(extractKeywords(textB));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = [...wordsA].filter(w => wordsB.has(w));
  const union = new Set([...wordsA, ...wordsB]);

  // Jaccard similarity
  return intersection.length / union.size;
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  // Stop words to exclude
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
 * Location proximity: same district = 1.0, same village = 1.0, different = 0
 */
function calculateLocationScore(a: Partial<Challenge>, b: Challenge): number {
  const districtA = (a.district || '').toLowerCase().trim();
  const districtB = (b.district || '').toLowerCase().trim();
  const villageA = (a.village || a.block || '').toLowerCase().trim();
  const villageB = (b.village || b.block || '').toLowerCase().trim();

  if (!districtA || !districtB) return 0;

  // Same exact village/panchayat = highest
  if (villageA && villageB && villageA === villageB) {
    return 1.0;
  }

  // Same district
  if (districtA === districtB) {
    // Bonus if also same block
    const blockA = (a.block || '').toLowerCase().trim();
    const blockB = (b.block || '').toLowerCase().trim();
    if (blockA && blockB && blockA === blockB) {
      return 0.9;
    }
    return 0.75;
  }

  // Adjacent districts (Jharkhand districts that share borders)
  const adjacentDistricts: Record<string, string[]> = {
    'ranchi': ['khunti', 'gumla', 'lohardaga', 'ramgarh'],
    'dhanbad': ['bokaro', 'giridih', 'koderma'],
    'bokaro': ['dhanbad', 'giridih', 'ramgarh', 'ranchi'],
    'palamu': ['garhwa', 'latehar', 'chatra'],
    'hazaribagh': ['koderma', 'giridih', 'chatra', 'ramgarh'],
    'deoghar': ['dumka', 'godda', 'jamtara'],
    'giridih': ['dhanbad', 'bokaro', 'koderma', 'hazaribagh'],
  };

  const adjA = adjacentDistricts[districtA] || [];
  const adjB = adjacentDistricts[districtB] || [];

  if (adjA.includes(districtB) || adjB.includes(districtA)) {
    return 0.4;
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

  // Exact match
  if (catA === catB) {
    return 1.0;
  }

  // Check if they share significant keywords
  const wordsA = extractKeywords(catA);
  const wordsB = extractKeywords(catB);
  const overlap = wordsA.filter(w => wordsB.some(bw => bw.includes(w) || w.includes(bw)));

  if (overlap.length >= 2) {
    return 0.6;
  }

  // Related domain check (keywords from domain taxonomy)
  const relatedDomains = getRelatedDomains(catA);
  if (relatedDomains.some(d => catB.includes(d))) {
    return 0.5;
  }

  return 0;
}

/**
 * Get related domain keywords for partial matching
 */
function getRelatedDomains(category: string): string[] {
  const domainMap: Record<string, string[]> = {
    'water': ['water', 'drinking', 'irrigation', 'pipeline', 'groundwater', 'river'],
    'road': ['road', 'transport', 'highway', 'bridge', 'traffic', 'pothole'],
    'electricity': ['electric', 'power', 'voltage', 'load shedding', 'transformer'],
    'health': ['hospital', 'clinic', 'doctor', 'medicine', 'disease', 'health'],
    'education': ['school', 'college', 'student', 'teacher', 'education', 'classroom'],
    'disaster': ['flood', 'drought', 'cyclone', 'earthquake', 'disaster', 'emergency'],
    'agriculture': ['farm', 'crop', 'farmer', 'agriculture', 'soil', 'irrigation'],
    'sanitation': ['toilet', 'sewage', 'drainage', 'garbage', 'waste', 'sanitation'],
  };

  const categoryLower = category.toLowerCase();
  for (const [, keywords] of Object.entries(domainMap)) {
    if (keywords.some(k => categoryLower.includes(k))) {
      return keywords;
    }
  }
  return [];
}

/**
 * Recency: more recent = higher score (challenges within 7 days get bonus)
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
 * Assign a challenge to a cluster (called after government validation)
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