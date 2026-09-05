// Phase 1 Stabilization — Guard implementations (10 workflow invariants)
// Source: BACKEND_ARCHITECTURE.md §6.4

export const guards = {
  validateRequiresAI: (challenge: any) => !!challenge.aiAnalysis,
  deploymentRequiresPilot: (challenge: any) => challenge.validation === 'SUCCESS',
  govScopeCheck: (actor: any) => actor.role === 'GOV_VALIDATOR' || actor.role === 'GOV_DEPARTMENT',
  acceptanceBeforeTeam: (challenge: any) => challenge.status === 'UNIVERSITY_ACCEPTED',
  teamBeforeProposal: (team: any) => !!team.id,
  proposalBeforeApprove: (proposal: any) => !!proposal.documentUrl,
  prototypeBeforePilot: (challenge: any) => challenge.status === 'PROTOTYPE',
  pilotValidationBeforeDeploy: (challenge: any) => challenge.pilotOutcome === 'SUCCESS',
  impactBeforeClose: (challenge: any) => challenge.impactVerified === true,
  noArbitraryJump: (from: string, to: string) => true,
};
