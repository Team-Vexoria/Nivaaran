import type { ChallengeStatus } from './workflowTypes';

export type WorkflowStageKey =
  | 'SUBMISSION'
  | 'AI_UNDERSTANDING'
  | 'VALIDATION'
  | 'DEDUPLICATION_CLUSTERING'
  | 'PRIORITIZATION'
  | 'INSTITUTION_MATCHING'
  | 'UNIVERSITY_ACCEPTANCE'
  | 'TEAM_FORMATION'
  | 'PROPOSAL'
  | 'INDUSTRY_CSR_COLLABORATION'
  | 'PROTOTYPE'
  | 'PILOT'
  | 'TECHNICAL_COMMUNITY_VALIDATION'
  | 'DEPLOYMENT'
  | 'IMPACT_MEASUREMENT'
  | 'CLOSURE_LEARNING';

export interface WorkflowStage {
  stageNumber: number;
  key: WorkflowStageKey;
  displayName: string;
  publicLabel: string;
  description: string;
  allowedNextStages: number[];
  isPublic: boolean;
}

export const LIFECYCLE_STAGES: WorkflowStage[] = [
  {
    stageNumber: 1,
    key: 'SUBMISSION',
    displayName: 'Submission',
    publicLabel: 'Submitted',
    description: 'Initial societal problem submitted by a citizen.',
    allowedNextStages: [2, 3, 4, 5],
    isPublic: true,
  },
  {
    stageNumber: 2,
    key: 'AI_UNDERSTANDING',
    displayName: 'AI Understanding',
    publicLabel: 'Under Review',
    description: 'AI triage, categorization, and initial risk assessment.',
    allowedNextStages: [2, 3, 4, 5],
    isPublic: true,
  },
  {
    stageNumber: 3,
    key: 'DEDUPLICATION_CLUSTERING',
    displayName: 'Deduplication / Clustering',
    publicLabel: 'Processing',
    description: 'AI groups similar challenges together.',
    allowedNextStages: [2, 4, 5],
    isPublic: false,
  },
  {
    stageNumber: 4,
    key: 'PRIORITIZATION',
    displayName: 'Prioritization',
    publicLabel: 'Prioritized',
    description: 'Assigning priority scores based on impact, urgency, etc.',
    allowedNextStages: [2, 5],
    isPublic: true,
  },
  {
    stageNumber: 5,
    key: 'VALIDATION',
    displayName: 'Validation',
    publicLabel: 'Validated',
    description: 'Government officer validates the challenge and evidence.',
    allowedNextStages: [2, 5, 6],
    isPublic: true,
  },
  {
    stageNumber: 6,
    key: 'INSTITUTION_MATCHING',
    displayName: 'Institution Matching',
    publicLabel: 'Finding Partners',
    description: 'Matching challenge with appropriate Higher Education Institutions (HEIs).',
    allowedNextStages: [7],
    isPublic: true,
  },
  {
    stageNumber: 7,
    key: 'UNIVERSITY_ACCEPTANCE',
    displayName: 'University Acceptance',
    publicLabel: 'University Accepted',
    description: 'A university accepts the challenge to work on.',
    allowedNextStages: [8],
    isPublic: true,
  },
  {
    stageNumber: 8,
    key: 'TEAM_FORMATION',
    displayName: 'Team Formation',
    publicLabel: 'In Progress',
    description: 'Students and faculty form a team to address the problem.',
    allowedNextStages: [9],
    isPublic: true,
  },
  {
    stageNumber: 9,
    key: 'PROPOSAL',
    displayName: 'Proposal',
    publicLabel: 'Solution Proposed',
    description: 'The team submits a structured solution proposal.',
    allowedNextStages: [10, 11],
    isPublic: true,
  },
  {
    stageNumber: 10,
    key: 'INDUSTRY_CSR_COLLABORATION',
    displayName: 'Industry / CSR Collaboration',
    publicLabel: 'Industry Collaboration',
    description: 'Connecting with CSR or industry for funding/mentorship.',
    allowedNextStages: [11],
    isPublic: true,
  },
  {
    stageNumber: 11,
    key: 'PROTOTYPE',
    displayName: 'Prototype',
    publicLabel: 'Prototype Active',
    description: 'Developing the initial working version of the solution.',
    allowedNextStages: [12, 13],
    isPublic: true,
  },
  {
    stageNumber: 12,
    key: 'PILOT',
    displayName: 'Pilot',
    publicLabel: 'Pilot Active',
    description: 'Field testing the solution in a controlled real-world environment.',
    allowedNextStages: [13, 14],
    isPublic: true,
  },
  {
    stageNumber: 13,
    key: 'TECHNICAL_COMMUNITY_VALIDATION',
    displayName: 'Technical / Community Validation',
    publicLabel: 'Outcome Audit',
    description: 'Gathering feedback and technical validation for the pilot/prototype.',
    allowedNextStages: [14],
    isPublic: true,
  },
  {
    stageNumber: 14,
    key: 'DEPLOYMENT',
    displayName: 'Deployment',
    publicLabel: 'Resolved',
    description: 'Full-scale rollout of the solution.',
    allowedNextStages: [15, 16],
    isPublic: true,
  },
  {
    stageNumber: 15,
    key: 'IMPACT_MEASUREMENT',
    displayName: 'Impact Measurement',
    publicLabel: 'Measuring Impact',
    description: 'Tracking the outcomes and social impact of the deployed solution.',
    allowedNextStages: [16],
    isPublic: true,
  },
  {
    stageNumber: 16,
    key: 'CLOSURE_LEARNING',
    displayName: 'Closure and Learning',
    publicLabel: 'Closed',
    description: 'Final archiving and publishing of lessons learned.',
    allowedNextStages: [],
    isPublic: true,
  }
];

export const STATUS_TO_STAGE_MAP: Record<ChallengeStatus, number> = {
  'Submitted': 1,
  'Under Review': 2,
  'Clustered': 3,
  'Prioritized': 4,
  'Evidence Requested': 5,
  'Rejected': 2,
  'Government Validated': 5,
  'HEI Matched': 6,
  'University Accepted': 7,
  'In Progress': 8,
  'Proposal Submitted': 9,
  'Industry Collaboration': 10,
  'Prototype Active': 11,
  'Pilot Active': 12,
  'Outcome Audit': 13,
  'Resolved': 14,
  'Closed': 16,
};

export const CHALLENGE_STATUS_OPTIONS: ChallengeStatus[] = [
  'Submitted',
  'Under Review',
  'Evidence Requested',
  'Rejected',
  'Government Validated',
  'Clustered',
  'Prioritized',
  'HEI Matched',
  'University Accepted',
  'In Progress',
  'Proposal Submitted',
  'Industry Collaboration',
  'Prototype Active',
  'Pilot Active',
  'Outcome Audit',
  'Resolved',
  'Closed',
];

const STATUS_ALIASES: Record<string, ChallengeStatus> = {
  'ai triage complete': 'Under Review',
  'validated': 'Government Validated',
  'clustered': 'Clustered',
  'prioritized': 'Prioritized',
  'matched': 'HEI Matched',
  'project active': 'In Progress',
  'collaboration': 'Industry Collaboration',
  'industry collaboration': 'Industry Collaboration',
  'prototype': 'Prototype Active',
  'pilot': 'Pilot Active',
  'outcome audit': 'Outcome Audit',
  'validation phase': 'Outcome Audit',
  'deployed': 'Resolved',
  'impact verified': 'Closed',
};

export function getStageMetadata(stageNumber: number): WorkflowStage | undefined {
  return LIFECYCLE_STAGES.find(s => s.stageNumber === stageNumber);
}

export function getStageForStatus(status: string): WorkflowStage | undefined {
  const normalized = normalizeLegacyStatus(status);
  return normalized ? getStageMetadata(STATUS_TO_STAGE_MAP[normalized]) : undefined;
}

export function normalizeLegacyStatus(status: string): ChallengeStatus | undefined {
  const normalized = status.trim();
  for (const option of CHALLENGE_STATUS_OPTIONS) {
    if (option === normalized) return option;
  }
  return STATUS_ALIASES[normalized.toLowerCase()];
}

export function formatStageName(stageNumber: number): string {
  const stage = getStageMetadata(stageNumber);
  return stage ? `Stage ${stage.stageNumber}: ${stage.displayName}` : 'Unknown Stage';
}

export function isValidStageTransition(currentStage: number, nextStage: number): boolean {
  if (currentStage === nextStage) return true;
  /* Direct government validation and triage transitions */
  if (currentStage >= 1 && currentStage <= 5 && (nextStage === 5 || nextStage === 6 || nextStage === 2)) {
    return true;
  }
  /* Executive administrative resolution or deployment transitions */
  if (nextStage === 14 || nextStage === 16) {
    return true;
  }
  const current = getStageMetadata(currentStage);
  if (!current) return false;
  return current.allowedNextStages.includes(nextStage);
}

export function getPublicStageLabel(stageNumber: number): string {
  const stage = getStageMetadata(stageNumber);
  return stage ? stage.publicLabel : 'Unknown Stage';
}

export function getPublicStatusLabel(status: string): string {
  const normalized = normalizeLegacyStatus(status);
  if (normalized === 'Evidence Requested') return 'Evidence Requested';
  const stage = normalized ? getStageForStatus(normalized) : undefined;
  return stage ? stage.publicLabel : 'Unknown Status';
}
