import { ChallengeStatus } from '@prisma/client';
export interface TransitionRule { from: ChallengeStatus[]; to: ChallengeStatus; action: string; requiredCapability: string; guardName: string; description: string; }
export const TRANSITIONS: TransitionRule[] = [
  { from: [ChallengeStatus.SUBMITTED], to: ChallengeStatus.UNDER_REVIEW, action: 'challenge:understand', requiredCapability: 'challenge:submit', guardName: 'submissionComplete', description: 'AI understanding' },
  { from: [ChallengeStatus.UNDER_REVIEW], to: ChallengeStatus.VALIDATED, action: 'challenge:validate', requiredCapability: 'challenge:validate', guardName: 'humanValidationReasonRequired', description: 'Validate' },
  { from: [ChallengeStatus.UNDER_REVIEW], to: ChallengeStatus.CLARIFICATION_REQUESTED, action: 'challenge:requestClarification', requiredCapability: 'challenge:requestClarification', guardName: 'reasonRequired', description: 'Clarify' },
  { from: [ChallengeStatus.CLARIFICATION_REQUESTED], to: ChallengeStatus.UNDER_REVIEW, action: 'challenge:resubmit', requiredCapability: 'challenge:resubmit', guardName: 'clarificationPayloadProvided', description: 'Resubmit' },
  { from: [ChallengeStatus.UNDER_REVIEW, ChallengeStatus.SUBMITTED], to: ChallengeStatus.REJECTED, action: 'challenge:reject', requiredCapability: 'challenge:reject', guardName: 'reasonRequired', description: 'Reject' },
  { from: [ChallengeStatus.VALIDATED], to: ChallengeStatus.CLUSTERED, action: 'challenge:cluster', requiredCapability: 'challenge:cluster', guardName: 'alwaysAllow', description: 'Cluster' },
  { from: [ChallengeStatus.CLUSTERED], to: ChallengeStatus.PRIORITIZED, action: 'challenge:prioritize', requiredCapability: 'challenge:prioritize', guardName: 'priorityComputed', description: 'Prioritize' },
  { from: [ChallengeStatus.PRIORITIZED], to: ChallengeStatus.MATCHING, action: 'challenge:match', requiredCapability: 'challenge:match', guardName: 'alwaysAllow', description: 'Match' },
  { from: [ChallengeStatus.MATCHING], to: ChallengeStatus.UNIVERSITY_ACCEPTED, action: 'matching:accept', requiredCapability: 'matching:accept', guardName: 'universityAdminScope', description: 'Accept' },
  { from: [ChallengeStatus.MATCHING], to: ChallengeStatus.MATCHING, action: 'matching:decline', requiredCapability: 'matching:decline', guardName: 'autoRematch', description: 'Rematch' },
  { from: [ChallengeStatus.UNIVERSITY_ACCEPTED], to: ChallengeStatus.TEAM_FORMING, action: 'team:create', requiredCapability: 'team:create', guardName: 'minTeamSeeded', description: 'Team create' },
  { from: [ChallengeStatus.TEAM_FORMING], to: ChallengeStatus.PROPOSAL_REVIEW, action: 'proposal:submit', requiredCapability: 'proposal:submit', guardName: 'documentAttached', description: 'Submit proposal' },
  { from: [ChallengeStatus.PROPOSAL_REVIEW], to: ChallengeStatus.PROJECT_ACTIVE, action: 'proposal:approve', requiredCapability: 'proposal:approve', guardName: 'universityAuthority', description: 'Approve proposal' },
  { from: [ChallengeStatus.PROPOSAL_REVIEW], to: ChallengeStatus.TEAM_FORMING, action: 'proposal:requestRevision', requiredCapability: 'proposal:requestRevision', guardName: 'revisionNotes', description: 'Revision' },
  { from: [ChallengeStatus.PROJECT_ACTIVE], to: ChallengeStatus.PROTOTYPE, action: 'project:prototype', requiredCapability: 'project:prototype', guardName: 'proposalApproved', description: 'Prototype' },
  { from: [ChallengeStatus.PROTOTYPE], to: ChallengeStatus.PILOT, action: 'project:pilot', requiredCapability: 'project:pilot', guardName: 'prototypeDeliverable', description: 'Pilot' },
  { from: [ChallengeStatus.PILOT], to: ChallengeStatus.VALIDATION_PENDING, action: 'project:validate', requiredCapability: 'project:validate', guardName: 'pilotSuccess', description: 'Success' },
  { from: [ChallengeStatus.PILOT], to: ChallengeStatus.PROTOTYPE, action: 'project:validate', requiredCapability: 'project:validate', guardName: 'needsImprovement', description: 'Needs improvement' },
  { from: [ChallengeStatus.VALIDATION_PENDING], to: ChallengeStatus.DEPLOYMENT_APPROVED, action: 'validation:confirm', requiredCapability: 'validation:confirm', guardName: 'reportApproved', description: 'Confirm' },
  { from: [ChallengeStatus.DEPLOYMENT_APPROVED], to: ChallengeStatus.DEPLOYED, action: 'deployment:approve', requiredCapability: 'deployment:approve', guardName: 'deploymentPlan', description: 'Approve deploy' },
  { from: [ChallengeStatus.DEPLOYED], to: ChallengeStatus.IMPACT_VERIFIED, action: 'impact:verify', requiredCapability: 'impact:verify', guardName: 'metricsEvidence', description: 'Verify impact' },
  { from: [ChallengeStatus.IMPACT_VERIFIED], to: ChallengeStatus.CLOSED, action: 'challenge:close', requiredCapability: 'challenge:close', guardName: 'closurePackage', description: 'Close' },
  { from: [ChallengeStatus.PROJECT_ACTIVE, ChallengeStatus.PROTOTYPE, ChallengeStatus.PILOT], to: ChallengeStatus.FAILED, action: 'workflow:escalate', requiredCapability: 'workflow:escalate', guardName: 'overdueOrRisk', description: 'Escalate' },
  { from: [ChallengeStatus.FAILED], to: ChallengeStatus.PROJECT_ACTIVE, action: 'workflow:resolve', requiredCapability: 'workflow:resolve', guardName: 'correctiveAction', description: 'Resolve' },
];
export function findTransition(fromStatus: ChallengeStatus, action: string) { return TRANSITIONS.find(t => t.from.includes(fromStatus) && t.action === action); }
export function getAllowedTransitions(fromStatus: ChallengeStatus) { return TRANSITIONS.filter(t => t.from.includes(fromStatus)); }
