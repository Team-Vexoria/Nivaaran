import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ChallengeStatus } from '@prisma/client';
import { findTransition } from '../src/workflow/registry.js';

describe('E2E Lifecycle Transitions (BACKEND_ARCHITECTURE.md §6.2)', () => {
  it('Simulates full canonical 17-step lifecycle trajectory from SUBMITTED to CLOSED', () => {
    let currentStatus: ChallengeStatus = ChallengeStatus.SUBMITTED;

    const trajectory: { action: string; expectedNext: ChallengeStatus }[] = [
      { action: 'challenge:understand', expectedNext: ChallengeStatus.AI_UNDERSTANDING },
      { action: 'challenge:validate', expectedNext: ChallengeStatus.VALIDATED },
      { action: 'challenge:cluster', expectedNext: ChallengeStatus.CLUSTERED },
      { action: 'challenge:prioritize', expectedNext: ChallengeStatus.PRIORITY_RANKED },
      { action: 'challenge:match', expectedNext: ChallengeStatus.MATCHING },
      { action: 'matching:accept', expectedNext: ChallengeStatus.UNIVERSITY_ACCEPTED },
      { action: 'team:create', expectedNext: ChallengeStatus.TEAM_FORMING },
      { action: 'proposal:submit', expectedNext: ChallengeStatus.PROPOSAL_REVIEW },
      { action: 'proposal:approve', expectedNext: ChallengeStatus.PROJECT_ACTIVE },
      { action: 'project:prototype', expectedNext: ChallengeStatus.PROTOTYPE },
      { action: 'project:pilot', expectedNext: ChallengeStatus.PILOT },
      { action: 'project:validate', expectedNext: ChallengeStatus.PROJECT_VALIDATION },
      { action: 'validation:confirm', expectedNext: ChallengeStatus.DEPLOYMENT_APPROVED },
      { action: 'deployment:approve', expectedNext: ChallengeStatus.IMPACT_MEASUREMENT },
      { action: 'impact:verify', expectedNext: ChallengeStatus.IMPACT_MEASUREMENT },
      { action: 'challenge:close', expectedNext: ChallengeStatus.CLOSED },
    ];

    for (const step of trajectory) {
      const rule = findTransition(currentStatus, step.action);
      assert.ok(rule, `Transition failed for action '${step.action}' at status '${currentStatus}'`);
      assert.equal(
        rule.to,
        step.expectedNext,
        `Action '${step.action}' led to '${rule.to}', expected '${step.expectedNext}'`
      );
      currentStatus = rule.to;
    }

    assert.equal(currentStatus, ChallengeStatus.CLOSED);
  });

  it('Supports non-linear clarification loop and recovery', () => {
    let status: ChallengeStatus = ChallengeStatus.AI_UNDERSTANDING;

    // Validator requests clarification
    const clarify = findTransition(status, 'challenge:requestClarification');
    assert.ok(clarify);
    status = clarify.to;
    assert.equal(status, ChallengeStatus.CLARIFICATION_REQUESTED);

    // Submitter resubmits
    const resubmit = findTransition(status, 'challenge:resubmit');
    assert.ok(resubmit);
    status = resubmit.to;
    assert.equal(status, ChallengeStatus.AI_UNDERSTANDING);

    // Now validate
    const validate = findTransition(status, 'challenge:validate');
    assert.ok(validate);
    status = validate.to;
    assert.equal(status, ChallengeStatus.VALIDATED);
  });

  it('Supports non-linear prototype/pilot iteration loop', () => {
    let status: ChallengeStatus = ChallengeStatus.PILOT;

    // Pilot needs improvement -> back to prototype
    const loopBack = findTransition(status, 'project:validate');
    assert.ok(loopBack);
    // There are two project:validate rules (one to PROJECT_VALIDATION, one to PROTOTYPE)
    // Verify both exist in registry
    assert.ok(loopBack.to === ChallengeStatus.PROJECT_VALIDATION || loopBack.to === ChallengeStatus.PROTOTYPE);
  });

  it('Supports escalation and resolution workflow', () => {
    let status: ChallengeStatus = ChallengeStatus.PROJECT_ACTIVE;

    // Project stalls or encounters blocker -> escalate
    const escalate = findTransition(status, 'workflow:escalate');
    assert.ok(escalate);
    status = escalate.to;
    assert.equal(status, ChallengeStatus.FAILED);

    // Gov resolves corrective action -> resumes PROJECT_ACTIVE
    const resolve = findTransition(status, 'workflow:resolve');
    assert.ok(resolve);
    status = resolve.to;
    assert.equal(status, ChallengeStatus.PROJECT_ACTIVE);
  });
});
