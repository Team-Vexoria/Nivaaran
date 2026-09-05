import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChallengeStatus } from '@prisma/client';
import { TRANSITIONS, findTransition, getAllowedTransitions } from '../src/workflow/registry.js';
import { checkGuard } from '../src/workflow/guards.js';

describe('Workflow State Machine Invariants (BACKEND_ARCHITECTURE.md §6.3)', () => {
  it('should define all canonical transition edges', () => {
    assert.ok(TRANSITIONS.length >= 22, `Expected at least 22 transition rules, found ${TRANSITIONS.length}`);
  });

  it('Invariant 1: SUBMITTED allows challenge:understand -> AI_UNDERSTANDING', () => {
    const rule = findTransition(ChallengeStatus.SUBMITTED, 'challenge:understand');
    assert.ok(rule, 'Transition rule not found for challenge:understand from SUBMITTED');
    assert.equal(rule.to, ChallengeStatus.AI_UNDERSTANDING);
    assert.equal(rule.requiredCapability, 'challenge:submit');
  });

  it('Invariant 2: AI_UNDERSTANDING allows validation, clarification, or rejection', () => {
    const validate = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:validate');
    assert.ok(validate);
    assert.equal(validate.to, ChallengeStatus.VALIDATED);

    const clarify = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:requestClarification');
    assert.ok(clarify);
    assert.equal(clarify.to, ChallengeStatus.CLARIFICATION_REQUESTED);

    const reject = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:reject');
    assert.ok(reject);
    assert.equal(reject.to, ChallengeStatus.REJECTED);
  });

  it('Invariant 3: No jumping stages — invalid actions must be rejected', () => {
    // Cannot jump from SUBMITTED directly to DEPLOYMENT_APPROVED
    const invalidJump1 = findTransition(ChallengeStatus.SUBMITTED, 'deployment:approve');
    assert.equal(invalidJump1, undefined);

    // Cannot jump from SUBMITTED directly to VALIDATED
    const invalidJump2 = findTransition(ChallengeStatus.SUBMITTED, 'challenge:validate');
    assert.equal(invalidJump2, undefined);

    // Cannot jump from VALIDATION_PENDING to CLOSED
    const invalidJump3 = findTransition(ChallengeStatus.VALIDATION_PENDING, 'challenge:close');
    assert.equal(invalidJump3, undefined);
  });

  it('Invariant 4: Clarification sub-cycle works correctly', () => {
    const toClarify = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:requestClarification');
    assert.ok(toClarify);
    assert.equal(toClarify.to, ChallengeStatus.CLARIFICATION_REQUESTED);

    const resubmit = findTransition(ChallengeStatus.CLARIFICATION_REQUESTED, 'challenge:resubmit');
    assert.ok(resubmit);
    assert.equal(resubmit.to, ChallengeStatus.AI_UNDERSTANDING);
  });

  it('Invariant 5: Academic matching and team forming transitions', () => {
    const accept = findTransition(ChallengeStatus.MATCHING, 'matching:accept');
    assert.ok(accept);
    assert.equal(accept.to, ChallengeStatus.UNIVERSITY_ACCEPTED);

    const team = findTransition(ChallengeStatus.UNIVERSITY_ACCEPTED, 'team:create');
    assert.ok(team);
    assert.equal(team.to, ChallengeStatus.TEAM_FORMING);

    const proposal = findTransition(ChallengeStatus.TEAM_FORMING, 'proposal:submit');
    assert.ok(proposal);
    assert.equal(proposal.to, ChallengeStatus.PROPOSAL_REVIEW);
  });

  it('Invariant 6: Deployment approval and impact verification leading to CLOSED', () => {
    const deploy = findTransition(ChallengeStatus.DEPLOYMENT_APPROVED, 'deployment:approve');
    assert.ok(deploy);
    assert.equal(deploy.to, ChallengeStatus.IMPACT_MEASUREMENT);

    const close = findTransition(ChallengeStatus.IMPACT_MEASUREMENT, 'challenge:close');
    assert.ok(close);
    assert.equal(close.to, ChallengeStatus.CLOSED);
  });

  it('Invariant 7: Escalation and resolution branch', () => {
    const escalate = findTransition(ChallengeStatus.PROJECT_ACTIVE, 'workflow:escalate');
    assert.ok(escalate);
    assert.equal(escalate.to, ChallengeStatus.FAILED);

    const resolve = findTransition(ChallengeStatus.FAILED, 'workflow:resolve');
    assert.ok(resolve);
    assert.equal(resolve.to, ChallengeStatus.PROJECT_ACTIVE);
  });

  it('getAllowedTransitions returns valid subset for any given status', () => {
    const allowedFromSubmitted = getAllowedTransitions(ChallengeStatus.SUBMITTED);
    assert.ok(allowedFromSubmitted.some(t => t.action === 'challenge:understand'));
    assert.ok(!allowedFromSubmitted.some(t => t.action === 'deployment:approve'));
  });

  it('Guards evaluate expected conditions', async () => {
    const pass = await checkGuard('alwaysAllow', {}, {});
    assert.equal(pass.allowed, true);

    const reasonMissing = await checkGuard('reasonRequired', {}, {});
    assert.equal(reasonMissing.allowed, false);

    const reasonPresent = await checkGuard('reasonRequired', {}, { reason: 'Sufficient evidence provided' });
    assert.equal(reasonPresent.allowed, true);
  });
});
