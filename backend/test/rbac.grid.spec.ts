import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TRANSITIONS, findTransition } from '../src/workflow/registry.js';
import { ChallengeStatus } from '@prisma/client';

// Role -> Capability mapping from BACKEND_ARCHITECTURE.md & src/core/auth.ts
const ROLE_CAPABILITIES: Record<string, string[]> = {
  SUPER_ADMIN: [
    'challenge:create', 'challenge:understand', 'challenge:validate', 'challenge:reject',
    'challenge:requestClarification', 'challenge:resubmit', 'challenge:cluster',
    'challenge:prioritize', 'challenge:match', 'matching:accept', 'matching:decline',
    'team:create', 'proposal:submit', 'proposal:approve', 'proposal:requestRevision',
    'project:prototype', 'project:pilot', 'project:validate', 'validation:confirm',
    'deployment:approve', 'impact:verify', 'challenge:close', 'workflow:escalate', 'workflow:resolve'
  ],
  GOV_VALIDATOR: [
    'challenge:validate', 'challenge:reject', 'challenge:requestClarification',
    'challenge:understand', 'validation:confirm',
  ],
  GOV_DEPARTMENT: [
    'challenge:prioritize', 'challenge:cluster', 'challenge:match',
    'matching:accept', 'matching:decline', 'project:prototype',
    'project:pilot', 'project:validate', 'deployment:approve',
    'impact:verify', 'challenge:close', 'workflow:escalate', 'workflow:resolve',
  ],
  UNIVERSITY: ['matching:accept', 'matching:decline', 'proposal:approve'],
  FACULTY: ['team:create', 'proposal:submit', 'proposal:approve', 'proposal:requestRevision', 'project:prototype'],
  STUDENT: ['proposal:submit'],
  INDUSTRY: ['proposal:submit'],
  CSR: ['proposal:submit'],
  LAB: ['proposal:submit'],
  COMMUNITY_NGO: ['challenge:resubmit', 'challenge:comment'],
  CITIZEN: ['challenge:create', 'challenge:resubmit'],
  PRI: ['challenge:create', 'challenge:resubmit'],
  ULB: ['challenge:create', 'challenge:resubmit'],
};

function isAuthorized(role: string, requiredCapability: string): boolean {
  if (role === 'SUPER_ADMIN') return true;
  const caps = ROLE_CAPABILITIES[role] || [];
  return caps.includes(requiredCapability);
}

describe('RBAC Matrix (RBAC_MATRIX.md & BACKEND_ARCHITECTURE.md §8)', () => {
  it('Citizen permissions: can create & resubmit, cannot validate or deploy', () => {
    assert.equal(isAuthorized('CITIZEN', 'challenge:create'), true);
    assert.equal(isAuthorized('CITIZEN', 'challenge:resubmit'), true);
    assert.equal(isAuthorized('CITIZEN', 'challenge:validate'), false);
    assert.equal(isAuthorized('CITIZEN', 'deployment:approve'), false);
    assert.equal(isAuthorized('CITIZEN', 'matching:accept'), false);
  });

  it('Gov Validator: front-of-funnel verification authority', () => {
    const validateRule = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:validate');
    assert.ok(validateRule);
    assert.equal(isAuthorized('GOV_VALIDATOR', validateRule.requiredCapability), true);

    const clarifyRule = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:requestClarification');
    assert.ok(clarifyRule);
    assert.equal(isAuthorized('GOV_VALIDATOR', clarifyRule.requiredCapability), true);

    const rejectRule = findTransition(ChallengeStatus.AI_UNDERSTANDING, 'challenge:reject');
    assert.ok(rejectRule);
    assert.equal(isAuthorized('GOV_VALIDATOR', rejectRule.requiredCapability), true);

    // Validator cannot approve deployments (Gov Department authority)
    const deployRule = findTransition(ChallengeStatus.DEPLOYMENT_APPROVED, 'deployment:approve');
    assert.ok(deployRule);
    assert.equal(isAuthorized('GOV_VALIDATOR', deployRule.requiredCapability), false);
  });

  it('Gov Department: back-of-funnel deployment and impact authority', () => {
    const deployRule = findTransition(ChallengeStatus.DEPLOYMENT_APPROVED, 'deployment:approve');
    assert.ok(deployRule);
    assert.equal(isAuthorized('GOV_DEPARTMENT', deployRule.requiredCapability), true);

    const impactRule = findTransition(ChallengeStatus.IMPACT_MEASUREMENT, 'impact:verify');
    assert.ok(impactRule);
    assert.equal(isAuthorized('GOV_DEPARTMENT', impactRule.requiredCapability), true);

    const closeRule = findTransition(ChallengeStatus.IMPACT_MEASUREMENT, 'challenge:close');
    assert.ok(closeRule);
    assert.equal(isAuthorized('GOV_DEPARTMENT', closeRule.requiredCapability), true);
  });

  it('University & Faculty: match acceptance and project stewardship', () => {
    const acceptRule = findTransition(ChallengeStatus.MATCHING, 'matching:accept');
    assert.ok(acceptRule);
    assert.equal(isAuthorized('UNIVERSITY', acceptRule.requiredCapability), true);

    const teamRule = findTransition(ChallengeStatus.UNIVERSITY_ACCEPTED, 'team:create');
    assert.ok(teamRule);
    assert.equal(isAuthorized('FACULTY', teamRule.requiredCapability), true);

    const proposalRule = findTransition(ChallengeStatus.TEAM_FORMING, 'proposal:submit');
    assert.ok(proposalRule);
    assert.equal(isAuthorized('FACULTY', proposalRule.requiredCapability), true);
    assert.equal(isAuthorized('STUDENT', proposalRule.requiredCapability), true);
  });

  it('Super Admin possesses universal authority across all transitions', () => {
    for (const transition of TRANSITIONS) {
      assert.equal(
        isAuthorized('SUPER_ADMIN', transition.requiredCapability),
        true,
        `SUPER_ADMIN should be authorized for capability: ${transition.requiredCapability}`
      );
    }
  });
});
