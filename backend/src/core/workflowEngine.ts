import { prisma } from './prisma.js';
import { findTransition, getAllowedTransitions } from '../workflow/registry.js';
import { checkGuard } from '../workflow/guards.js';
import { ChallengeStatus, AuditAction } from '@prisma/client';
import { NotFoundError, ForbiddenError, ConflictError } from './errors.js';

export async function transitionChallenge(
  challengeId: string,
  action: string,
  authContext: any,
  payload?: any,
  ifMatchVersion?: number
) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      evidence: true,
      validations: { take: 1, orderBy: { decided_at: 'desc' } },
    },
  });

  if (!challenge) {
    throw new NotFoundError(`Challenge with id ${challengeId} not found`);
  }

  // 1. Optimistic Concurrency Control (If-Match)
  if (ifMatchVersion !== undefined && challenge.version !== ifMatchVersion) {
    throw new ConflictError(
      `Stale version: requested version ${ifMatchVersion} does not match current version ${challenge.version}`,
      { currentVersion: [String(challenge.version)], requestedVersion: [String(ifMatchVersion)] }
    );
  }

  // 2. State Machine Transition Edge Validation (Invariant 3: No jumping stages)
  const currentStatus = challenge.status as ChallengeStatus;
  const rule = findTransition(currentStatus, action);
  if (!rule) {
    const allowedActions = getAllowedTransitions(currentStatus).map(t => t.action);
    throw new ConflictError(
      `Transition action '${action}' is not allowed from status '${currentStatus}'`,
      {
        currentStatus: [currentStatus],
        attemptedAction: [action],
        availableTransitions: allowedActions,
      }
    );
  }

  // 3. Authorization Check (Invariant 4: Only authorized actors cause consequential transitions)
  if (authContext) {
    const permissions: Set<string> = authContext.permissions || new Set();
    const roles: string[] = authContext.roles || [];
    const isSuperAdmin =
      roles.includes('SUPER_ADMIN') ||
      roles.includes('Platform Super Admin') ||
      permissions.has('*');

    const hasPermission = isSuperAdmin || permissions.has(rule.requiredCapability);

    if (!hasPermission && rule.requiredCapability) {
      throw new ForbiddenError(
        `Actor lacks required capability '${rule.requiredCapability}' for action '${action}'`
      );
    }
  }

  // 4. Invariant Guards Check
  const guardVerdict = checkGuard(rule.guardName, challenge, payload, authContext);
  if (!guardVerdict.allowed) {
    throw new ConflictError(
      `Workflow guard failed for '${rule.guardName}': ${guardVerdict.reason || 'Preconditions not met'}`,
      { guardName: [rule.guardName], reason: [guardVerdict.reason || 'Preconditions not met'] }
    );
  }

  // 5. Transactional Execution: Atomic status update + append-only audit + durable outbox event
  const toStatus = rule.to;
  const actorId = authContext?.user?.id || 'system';
  const actorName = authContext?.user?.name || 'System';
  const actorRole = (authContext?.roles && authContext.roles[0]) || 'SYSTEM';
  const humanReason = payload?.reason || payload?.notes || rule.description;

  const result = await prisma.$transaction(async (tx) => {
    // 5a. Update Challenge
    const updated = await tx.challenge.update({
      where: { id: challengeId },
      data: {
        status: toStatus,
        version: { increment: 1 },
        transitioned_at: new Date(),
        updated_at: new Date(),
        ...(payload?.priorityScore !== undefined && { priority_score: payload.priorityScore }),
        ...(payload?.assignedHEI && { assigned_org_id: payload.assignedHEI }),
      },
    });

    // 5b. Append-only Audit Event
    let auditAction: AuditAction = AuditAction.VALIDATE;
    if (action.includes('submit') || action === 'challenge:understand') auditAction = AuditAction.SUBMIT;
    else if (action.includes('prioritize')) auditAction = AuditAction.PRIORITIZE;
    else if (action.includes('match')) auditAction = AuditAction.MATCH;
    else if (action.includes('accept')) auditAction = AuditAction.ACCEPT;
    else if (action.includes('reject')) auditAction = AuditAction.INVALIDATE;
    else if (action.includes('defer')) auditAction = AuditAction.DEFER;
    else if (action.includes('cluster')) auditAction = AuditAction.RECLUSTER;
    else if (action.includes('team')) auditAction = AuditAction.FORM_TEAM;
    else if (action.includes('prototype')) auditAction = AuditAction.START_PROTOTYPE;
    else if (action.includes('pilot')) auditAction = AuditAction.START_PILOT;
    else if (action.includes('deploy')) auditAction = AuditAction.APPROVE_DEPLOYMENT;
    else if (action.includes('impact')) auditAction = AuditAction.RECORD_IMPACT;
    else if (action.includes('close')) auditAction = AuditAction.CLOSE;
    else if (action.includes('escalate')) auditAction = AuditAction.ESCALATE;
    else if (action.includes('resolve')) auditAction = AuditAction.RESOLVE;

    const auditEvent = await tx.auditEvent.create({
      data: {
        actor_id: actorId,
        actor_role: actorRole,
        actor_org_id: authContext?.user?.organization_id || null,
        action: auditAction,
        resource_type: 'challenge',
        resource_id: challengeId,
        from_state: currentStatus,
        to_state: toStatus,
        human_reason: humanReason,
        ai_recommendation_id: payload?.aiRecommendationId || null,
        payload_snapshot: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      },
    });

    // 5c. Durable Transactional Outbox Event
    const outboxEvent = await tx.outboxEvent.create({
      data: {
        event_type: `challenge:${action}`,
        aggregate_type: 'challenge',
        aggregate_id: challengeId,
        payload: {
          challengeId,
          title: challenge.title,
          fromStatus: currentStatus,
          toStatus,
          action,
          actor: { id: actorId, name: actorName, role: actorRole },
          timestamp: new Date().toISOString(),
        },
      },
    });

    return { updated, auditEvent, outboxEvent };
  });

  return {
    challenge: result.updated,
    appliedAction: action,
    fromStatus: currentStatus,
    toStatus,
    availableTransitions: getAllowedTransitions(toStatus).map(t => t.action),
    auditEventId: result.auditEvent.id,
    outboxEventId: result.outboxEvent.id,
  };
}
