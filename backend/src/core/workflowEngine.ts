import { prisma } from './prisma';
import { ChallengeStatus } from '@prisma/client';

export class WorkflowEngine {
  /**
   * Core transition function for challenges
   * Enforces rules before allowing a state change
   */
  static async transitionChallenge(
    challengeId: string, 
    action: string, 
    actorId: string, 
    payload: any
  ) {
    // 1. Fetch current challenge and version
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new Error('Challenge not found');

    // 2. TODO: Authorize actor for this action (RBAC)

    // 3. TODO: Resolve target state from the action (State machine rules)
    let targetState: ChallengeStatus = challenge.status; // Placeholder
    
    // 4. Execute atomic transaction (update challenge, insert audit, insert outbox)
    return prisma.$transaction(async (tx) => {
      const updated = await tx.challenge.update({
        where: { id: challengeId, version: challenge.version },
        data: {
          status: targetState,
          version: { increment: 1 },
          transitioned_at: new Date()
        }
      });

      // Insert audit event
      await tx.auditEvent.create({
        data: {
          actor_id: actorId,
          action: 'RESOLVE', // Placeholder for actual AuditAction enum mapping
          resource_type: 'challenge',
          resource_id: challengeId,
          from_state: challenge.status,
          to_state: targetState,
          payload_snapshot: payload
        }
      });

      // Insert outbox event for async side effects (notifications, AI triggers)
      await tx.outboxEvent.create({
        data: {
          event_type: `challenge.${action}`,
          aggregate_type: 'challenge',
          aggregate_id: challengeId,
          payload: { challengeId, targetState, actorId }
        }
      });

      return updated;
    });
  }
}
