import { ChallengeStatus } from '@prisma/client';

export interface TransitionRule {
  from: ChallengeStatus[]; // supports multi-from (e.g., UNDER_REVIEW / SUBMITTED)
  to: ChallengeStatus;
  action: string;
  requiredCapability: string;
  guardName: string;
  payloadSchema?: string;
  description: string;
}

// All 22 explicit transition edges from BACKEND_ARCHITECTURE.md §6.3 (line 263-289)
// Plus branching / self-edges (escalate / resolve)
export const TRANSITIONS: TransitionRule[] = [
  { from: [ChallengeStatus.SUBMITTED], to: ChallengeStatus.UNDER_REVIEW, action: 'challenge:understand', requiredCapability: 'challenge:submit', guardName: 'submissionComplete', description: 'System triggers AI understanding' },
  { from: [ChallengeStatus.UNDER_REVIEW], to: ChallengeStatus.VALIDATED, action: 'challenge:validate', requiredCapability: 'challenge:validate', guardName: 'humanValidationReasonRequired', description: 'Gov validator approves' },
  { from: [ChallengeStatus.UNDER_REVIEW], to: ChallengeStatus.CLARIFICATION_REQUESTED, action: 'challenge:requestClarification', requiredCapability: 'challenge:requestClarification', guardName: 'reasonRequired', description: 'Validator requests clarification' },
  { from: [ChallengeStatus.CLARIFICATION_REQUESTED], to: ChallengeStatus.UNDER_REVIEW, action: 'challenge:resubmit', requiredCapability: 'challenge:resubmit', guardName: 'clarificationPayloadProvided', description: 'Citizen resubmits' },
  { from: [ChallengeStatus.UNDER_REVIEW, ChallengeStatus.SUBMITTED], to: ChallengeStatus.REJECTED, action: 'challenge:reject', requiredCapability: 'challenge:reject', guardName: 'reasonRequired', description: 'Rejected with justification' },
  { from: [ChallengeStatus.VALIDATED], to: ChallengeStatus.CLUSTERED, action: 'challenge:cluster', requiredCapability: 'challenge:cluster', guardName: 'alwaysAllow', description: 'Similarity run' },
  { from: [ChallengeStatus.CLUSTERED], to: ChallengeStatus.PRIORITIZED, action: 'challenge:prioritize', requiredCapability: 'challenge:prioritize', guardName: 'priorityComputed', description: 'Coordinator confirms' },
  { from: [ChallengeStatus.PRIORITIZED], to: ChallengeStatus.MATCHING, action: 'challenge:match', requiredCapability: 'challenge:match', guardName: 'alwaysAllow', description: 'HEI candidates generated' },
  { from: [ChallengeStatus.MATCHING], to: ChallengeStatus.UNIVERSITY_ACCEPTED, action: 'matching:accept', requiredCapability: 'matching:accept', guardName: 'universityAdminScope', description: 'University accepts offer' },
  { from: [ChallengeStatus.MATCHING], to: ChallengeStatus.MATCHING, action: 'matching:decline', requiredCapability: 'matching:decline', guardName: 'autoRematch', description: 'Auto-rematch to alternates' },
  { from: [ChallengeStatus.UNIVERSITY_ACCEPTED], to: ChallengeStatus.TEAM_FORMING, action: 'team:create', requiredCapability: 'team:create', guardName: 'minTeamSeeded', description: 'Faculty creates team' },
  { from: [ChallengeStatus.TEAM_FORMING], to: ChallengeStatus.PROPOSAL_REVIEW, action: 'proposal:submit', requiredCapability: 'proposal:submit', guardName: 'documentAttached', description: 'Proposal submitted' },
  { from: [ChallengeStatus.PROPOSAL_REVIEW], to: ChallengeStatus.PROJECT_ACTIVE, action: 'proposal:approve', requiredCapability: 'proposal:approve', guardName: 'universityAuthority', description: 'Proposal approved' },
  { from: [ChallengeStatus.PROPOSAL_REVIEW], to: ChallengeStatus.TEAM_FORMING, action: 'proposal:requestRevision', requiredCapability: 'proposal:requestRevision', guardName: 'revisionNotes', description: 'Revision requested' },
  { from: [ChallengeStatus.PROJECT_ACTIVE], to: ChallengeStatus.PROTOTYPE, action: 'project:prototype', requiredCapability: 'project:prototype', guardName: 'proposalApproved', description: 'Prototype stage' },
  { from: [ChallengeStatus.PROTOTYPE], to: ChallengeStatus.PILOT, action: 'project:pilot', requiredCapability: 'project:pilot', guardName: 'prototypeDeliverable', description: 'Pilot stage' },
  { from: [ChallengeStatus.PILOT], to: ChallengeStatus.VALIDATION_PENDING, action: 'project:validate', requiredCapability: 'project:validate', guardName: 'pilotSuccess', payloadSchema: '{outcome: "SUCCESS" | "NEEDS_IMPROVEMENT"}', description: 'Validation outcome' },
  { from: [ChallengeStatus.PILOT], to: ChallengeStatus.PROTOTYPE, action: 'project:validate', requiredCapability: 'project:validate', guardName: 'needsImprovement', payloadSchema: '{outcome: "NEEDS_IMPROVEMENT"}', description: 'Back to prototype' },
  { from: [ChallengeStatus.VALIDATION_PENDING], to: ChallengeStatus.DEPLOYMENT_APPROVED, action: 'validation:confirm', requiredCapability: 'validation:confirm', guardName: 'reportApproved', description: 'Gov confirms' },
  { from: [ChallengeStatus.DEPLOYMENT_APPROVED], to: ChallengeStatus.DEPLOYED, action: 'deployment:approve', requiredCapability: 'deployment:approve', guardName: 'deploymentPlan', description: 'Deployment approved' },
  { from: [ChallengeStatus.DEPLOYED], to: ChallengeStatus.IMPACT_VERIFIED, action: 'impact:verify', requiredCapability: 'impact:verify', guardName: 'metricsEvidence', description: 'Impact verified' },
  { from: [ChallengeStatus.IMPACT_VERIFIED], to: ChallengeStatus.CLOSED, action: 'challenge:close', requiredCapability: 'challenge:close', guardName: 'closurePackage', description: 'Closure complete' },
  // Branching / recovery
  { from: [ChallengeStatus.PROJECT_ACTIVE, ChallengeStatus.PROTOTYPE, ChallengeStatus.PILOT], to: ChallengeStatus.FAILED, action: 'workflow:escalate', requiredCapability: 'workflow:escalate', guardName: 'overdueOrRisk', description: 'Escalation' },
  { from: [ChallengeStatus.FAILED], to: ChallengeStatus.PROJECT_ACTIVE, action: 'workflow:resolve', requiredCapability: 'workflow:resolve', guardName: 'correctiveAction', description: 'Resolve stalled' },
];

export function findTransition(fromStatus: ChallengeStatus, action: string): TransitionRule | undefined {
  return TRANSITIONS.find(t => t.from.includes(fromStatus) && t.action === action);
}

export function getAllowedTransitions(fromStatus: ChallengeStatus): TransitionRule[] {
  return TRANSITIONS.filter(t => t.from.includes(fromStatus));
}
