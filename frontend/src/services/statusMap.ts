// Status mapping: frontend Title-Case -> backend UPPER_SNAKE + registry action
export const STATUS_MAP: Record<string, { status: string; action: string }> = {
  'Submitted': { status: 'SUBMITTED', action: 'challenge:submit' },
  'Under Review': { status: 'VALIDATION_PENDING', action: 'challenge:understand' },
  'Evidence Requested': { status: 'CLARIFICATION_REQUESTED', action: 'challenge:requestClarification' },
  'Rejected': { status: 'REJECTED', action: 'challenge:reject' },
  'Government Validated': { status: 'VALIDATED', action: 'challenge:validate' },
  'Clustered': { status: 'CLUSTERED', action: 'challenge:cluster' },
  'Prioritized': { status: 'PRIORITY_RANKED', action: 'challenge:prioritize' },
  'HEI Matched': { status: 'MATCHING', action: 'challenge:match' },
  'University Accepted': { status: 'UNIVERSITY_ACCEPTED', action: 'matching:accept' },
  'In Progress': { status: 'TEAM_FORMING', action: 'challenge:team' },
  'Proposal Submitted': { status: 'PROPOSAL_REVIEW', action: 'challenge:proposal' },
  'Industry Collaboration': { status: 'COLLABORATION', action: 'challenge:collaborate' },
  'Prototype Active': { status: 'PROTOTYPE', action: 'challenge:prototype' },
  'Pilot Active': { status: 'PILOT', action: 'challenge:pilot' },
  'Outcome Audit': { status: 'PROJECT_VALIDATION', action: 'challenge:validateOutcome' },
  'Resolved': { status: 'DEPLOYMENT_APPROVED', action: 'challenge:deploy' },
  'Closed': { status: 'CLOSED', action: 'challenge:close' },
};

export function mapStatus(titleCase: string): { status: string; action: string } | null {
  return STATUS_MAP[titleCase] ?? null;
}
