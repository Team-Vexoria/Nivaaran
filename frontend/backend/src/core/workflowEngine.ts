import { prisma } from './prisma';
import { findTransition, getAllowedTransitions } from '../workflow/registry';
import { checkGuard } from '../workflow/guards';
import { ChallengeStatus, AuditAction } from '@prisma/client';
import { NotFoundError, ForbiddenError, ConflictError } from './errors';

export async function transitionChallenge(challengeId: string, action: string, authContext: any, payload?: any, ifMatchVersion?: number) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId }, include: { evidence: true, validations: { take: 1, orderBy: { decided_at: 'desc' } } } });
  if (!challenge) throw new NotFoundError(`Challenge not found`);
  if (ifMatchVersion !== undefined && challenge.version !== ifMatchVersion) throw new ConflictError(`Stale version`);
  const currentStatus = challenge.status as ChallengeStatus;
  const rule = findTransition(currentStatus, action);
  if (!rule) throw new ConflictError(`Action '${action}' not allowed from '${currentStatus}'`);
  if (authContext) {
    const permissions = authContext.permissions || new Set();
    const roles = authContext.roles || [];
    const isSuperAdmin = roles.includes('SUPER_ADMIN') || permissions.has('*');
    if (!isSuperAdmin && !permissions.has(rule.requiredCapability)) throw new ForbiddenError(`Missing capability: ${rule.requiredCapability}`);
  }
  const guardVerdict = checkGuard(rule.guardName, challenge, payload, authContext);
  if (!guardVerdict.allowed) throw new ConflictError(`Guard '${rule.guardName}': ${guardVerdict.reason || 'Preconditions not met'}`);
  const toStatus = rule.to;
  const actorId = authContext?.user?.id || 'system';
  const actorRole = authContext?.roles?.[0] || 'SYSTEM';
  const auditAction = action.includes('close') ? AuditAction.CLOSE : action.includes('deploy') ? AuditAction.APPROVE_DEPLOYMENT : AuditAction.VALIDATE;
  return await prisma.$transaction(async (tx) => {
    const updated = await tx.challenge.update({ where: { id: challengeId, version: challenge.version }, data: { status: toStatus, version: { increment: 1 }, transitioned_at: new Date(), updated_at: new Date() } });
    await tx.auditEvent.create({ data: { actor_id: actorId, actor_role: actorRole, action: auditAction, from_state: currentStatus, to_state: toStatus, payload_json: payload || {} } });
    await tx.outboxEvent.create({ data: { event_type: action, payload_json: payload || {}, processed: false } });
    return { challenge: updated, status: toStatus, nextTransitions: getAllowedTransitions(toStatus).map(t => t.action) };
  });
}
