import { prisma } from './prisma.js';
import { allowed } from '../workflow/registry.js';

export async function transitionChallenge(challengeId: string, action: string, resolver: any) {
  const ch = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!ch) throw new Error('CHALLENGE_NOT_FOUND');
  const from = ch.status as string;
  const to = resolveTarget(from, action);
  if (!allowed(from, to, action)) throw new Error('TRANSITION_NOT_ALLOWED');
  const authPerm = auth?.permissions || new Set(); if (!authPerm.has('challenge:prioritize') && !authPerm.has('*')) throw new Error('FORBIDDEN');
  await prisma.challenge.update({ where: { id: challengeId }, data: { status: to as any } });
  return { id: challengeId, from, to, action };
}
function resolveTarget(from: string, action: string) {
  const map: Record<string,string> = { understand:'AI_UNDERSTANDING', validate:'VALIDATED', reject:'REJECTED', prioritize:'CLUSTERED', match:'MATCHED', accept:'IN_PILOT', approve:'IN_DEPLOYMENT', verify:'IN_PROGRESS', close:'CLOSED', requestClarification:'CLARIFICATION_REQUESTED', confirm:'VALIDATED' };
  return map[action] || from;
}
