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

  priorityFactorsPresent: (_ch: any, payload: any) => {
    if (payload?.priorityScore !== undefined && (payload.priorityScore < 0 || payload.priorityScore > 100)) {
      return { allowed: false, reason: 'Priority score must be a number between 0 and 100.' };
    }
    return { allowed: true };
  },

  universityScopeCheck: (_ch: any, payload: any, auth: any) => {
    if (payload?.universityId && auth?.user?.organization_id && auth.user.organization_id !== payload.universityId) {
      return { allowed: false, reason: 'You can only accept matches on behalf of your own registered university.' };
    }
    return { allowed: true };
  },

  declineWithRematchGuard: (_ch: any, payload: any) => {
    if (!payload?.reason) {
      return { allowed: false, reason: 'Decline reason required so alternative HEI matching can be optimized.' };
    }
    return { allowed: true };
  },

  teamCompositionGuard: (_ch: any, payload: any) => {
    if (payload?.members && Array.isArray(payload.members) && payload.members.length < 2) {
      return { allowed: false, reason: 'Multidisciplinary team must have at least 2 members (faculty mentor + student).' };
    }
    return { allowed: true };
  },

  proposalDocumentPresent: () => ({ allowed: true }),
  prototypeDeliverablePresent: () => ({ allowed: true }),
  pilotMetricsPresent: () => ({ allowed: true }),
  deploymentPlanPresent: () => ({ allowed: true }),
  impactMetricsPresent: () => ({ allowed: true }),
  closurePackageComplete: () => ({ allowed: true }),
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
