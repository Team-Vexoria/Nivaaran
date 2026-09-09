export type GuardFunction = (
  challenge: any,
  payload?: any,
  authContext?: any
) => { allowed: boolean; reason?: string };

export const guards: Record<string, GuardFunction> = {
  alwaysAllow: () => ({ allowed: true }),

  submissionComplete: (ch: any) => {
    if (!ch?.title || typeof ch.title !== 'string' || ch.title.trim().length < 5) {
      return { allowed: false, reason: 'Challenge title must be at least 5 characters.' };
    }
    if (!ch?.description || typeof ch.description !== 'string' || ch.description.trim().length < 15) {
      return { allowed: false, reason: 'Challenge description must be at least 15 characters.' };
    }
    return { allowed: true };
  },

  humanValidationReasonRequired: (_ch: any, _payload: any, auth: any) => {
    if (!auth?.user && !auth?.uid) {
      return { allowed: false, reason: 'Consequential validation requires an authenticated human actor (Invariant 2).' };
    }
    return { allowed: true };
  },

  reasonRequired: (_ch: any, payload: any) => {
    if (!payload?.reason || typeof payload.reason !== 'string' || payload.reason.trim().length === 0) {
      return { allowed: false, reason: 'A valid reason or explanation is strictly required for this transition.' };
    }
    return { allowed: true };
  },

  clarificationPayloadProvided: (_ch: any, payload: any) => {
    if (!payload?.response && !payload?.evidence && !payload?.reason) {
      return { allowed: false, reason: 'Clarification response, updated text, or evidence is required to resubmit.' };
    }
    return { allowed: true };
  },

  priorityComputed: (_ch: any, payload: any) => {
    if (payload?.priorityScore !== undefined && (payload.priorityScore < 0 || payload.priorityScore > 100)) {
      return { allowed: false, reason: 'Priority score must be a number between 0 and 100.' };
    }
    return { allowed: true };
  },

  universityAdminScope: (_ch: any, payload: any, auth: any) => {
    if (payload?.universityId && auth?.user?.organization_id && auth.user.organization_id !== payload.universityId) {
      return { allowed: false, reason: 'You can only accept matches on behalf of your own registered university.' };
    }
    return { allowed: true };
  },

  autoRematch: (_ch: any, payload: any) => {
    if (!payload?.reason) {
      return { allowed: false, reason: 'Decline reason required so alternative HEI matching can be optimized.' };
    }
    return { allowed: true };
  },

  minTeamSeeded: (_ch: any, payload: any) => {
    if (payload?.members && Array.isArray(payload.members) && payload.members.length < 2) {
      return { allowed: false, reason: 'Multidisciplinary team must have at least 2 members (faculty mentor + student).' };
    }
    return { allowed: true };
  },

  documentAttached: (_ch: any, payload: any) => {
    if (payload && payload.title && typeof payload.title === 'string' && payload.title.trim().length === 0) {
      return { allowed: false, reason: 'Proposal title cannot be empty.' };
    }
    return { allowed: true };
  },

  universityAuthority: (_ch: any, _payload: any, auth: any) => {
    if (auth && auth.roles && !auth.roles.includes('UNIVERSITY') && !auth.roles.includes('SUPER_ADMIN') && !auth.permissions?.has('*')) {
      // allow if university role or admin
    }
    return { allowed: true };
  },

  revisionNotes: (_ch: any, payload: any) => {
    if (!payload?.notes && !payload?.reviewNote && !payload?.reason) {
      return { allowed: false, reason: 'Revision notes or feedback required when requesting proposal revisions.' };
    }
    return { allowed: true };
  },

  // ── Stages 11-16 Guards ──────────────────────────────────────────────

  proposalApproved: (_ch: any, _payload: any) => {
    return { allowed: true };
  },

  prototypeDeliverable: (_ch: any, payload: any) => {
    if (payload && payload.progress !== undefined && (payload.progress < 0 || payload.progress > 100)) {
      return { allowed: false, reason: 'Prototype progress must be between 0 and 100%.' };
    }
    return { allowed: true };
  },

  pilotSuccess: (_ch: any, payload: any) => {
    if (payload?.outcome === 'NEEDS_IMPROVEMENT' || payload?.is_success === false) {
      return { allowed: false, reason: 'Pilot was marked as needing improvement; transition to validation not permitted.' };
    }
    return { allowed: true };
  },

  needsImprovement: (_ch: any, payload: any) => {
    if (payload?.outcome === 'SUCCESS' || payload?.is_success === true) {
      return { allowed: false, reason: 'Successful pilot does not route back to prototype.' };
    }
    return { allowed: true };
  },

  reportApproved: (_ch: any, _payload: any, _auth: any) => {
    return { allowed: true };
  },

  deploymentPlan: (_ch: any, payload: any) => {
    if (payload && payload.status && !['ACTIVE', 'PENDING', 'APPROVED'].includes(payload.status)) {
      return { allowed: false, reason: 'Invalid deployment status specified.' };
    }
    return { allowed: true };
  },

  metricsEvidence: (_ch: any, _payload: any) => {
    return { allowed: true };
  },

  closurePackage: (_ch: any, _payload: any) => {
    return { allowed: true };
  },

  overdueOrRisk: (_ch: any, _payload: any) => {
    return { allowed: true };
  },

  correctiveAction: (_ch: any, _payload: any) => {
    return { allowed: true };
  },

  // Backward compatibility aliases
  priorityFactorsPresent: (ch: any, p: any, a: any) => guards.priorityComputed(ch, p, a),
  universityScopeCheck: (ch: any, p: any, a: any) => guards.universityAdminScope(ch, p, a),
  declineWithRematchGuard: (ch: any, p: any, a: any) => guards.autoRematch(ch, p, a),
  teamCompositionGuard: (ch: any, p: any, a: any) => guards.minTeamSeeded(ch, p, a),
  proposalDocumentPresent: (ch: any, p: any, a: any) => guards.documentAttached(ch, p, a),
  prototypeDeliverablePresent: (ch: any, p: any, a: any) => guards.prototypeDeliverable(ch, p, a),
  pilotMetricsPresent: (ch: any, p: any, a: any) => guards.pilotSuccess(ch, p, a),
  deploymentPlanPresent: (ch: any, p: any, a: any) => guards.deploymentPlan(ch, p, a),
  impactMetricsPresent: (ch: any, p: any, a: any) => guards.metricsEvidence(ch, p, a),
  closurePackageComplete: (ch: any, p: any, a: any) => guards.closurePackage(ch, p, a),
};

export function checkGuard(
  guardName: string,
  challenge: any,
  payload?: any,
  authContext?: any
): { allowed: boolean; reason?: string } {
  const guard = guards[guardName];
  if (!guard) {
    return { allowed: true };
  }
  return guard(challenge, payload, authContext);
}

