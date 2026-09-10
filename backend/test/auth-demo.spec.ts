// NIVAARAN — controlled demo authentication & authorization.
//
// These run with NO live services (no Postgres, Redis, or Firebase). The demo
// bypass in `core/auth.ts` authenticates a `Bearer demo-*` token BEFORE any
// controller runs, deriving the role from the token alone — so every assertion
// here is evaluated by the auth-guard layer and never needs a database:
//
//   • an unauthenticated request is denied a protected endpoint (401)
//   • a CITIZEN token CAN submit a challenge (authz passes; status is not 401/403)
//   • a CITIZEN token CANNOT validate a challenge (403)
//   • a CITIZEN token CANNOT approve a deployment (403)
//   • `x-demo-role: SUPER_ADMIN` does NOT escalate a CITIZEN token (403)
//   • each demo token receives only the capability set of its seeded role(s)
//   • the fixed demo-identity map stays consistent with the seed data
//
// This spec pins `NODE_ENV=development` + `DEMO_AUTH_ENABLED=true` BEFORE any
// import that transitively loads config, so `demoModeEnabled()` is active. Each
// `*.spec.ts` runs in its own process, so this does not affect other specs.

process.env.NODE_ENV = 'development';
process.env.DEMO_AUTH_ENABLED = 'true';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import { app } from '../src/app.js';
import { getConfig, loadConfig } from '../src/core/config.js';
import { DEMO_IDENTITIES } from '../src/core/auth.js';
import { prisma } from '../src/core/prisma.js';
import { DEMO_USERS } from '../prisma/seeds/demo.js';

// Captured at import: `app` built its CORS origin from this config.
getConfig() ?? loadConfig();

interface Res {
  status: number;
  body: any;
}

async function authed(
  base: string,
  path: string,
  method: string,
  bearer?: string,
  headers: Record<string, string> = {},
): Promise<Res> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', ...headers };
  if (bearer) h['Authorization'] = `Bearer ${bearer}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: h,
    body: method === 'GET' ? undefined : JSON.stringify({ action: 'validate', title: 'x' }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

describe('controlled demo authentication and authorization (in-process server)', () => {
  let server: Server;
  let base = '';

  before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await prisma.$disconnect().catch(() => {});
  });

  const POST_CHALLENGE = '/api/v1/challenges'; // guard: challenge:create
  const POST_TRANSITION = '/api/v1/challenges/x/transition'; // guard: challenge:validate
  const POST_APPROVE_DEPLOY = '/api/v1/deployments/x/approve'; // guard: deployment:approve

  it('denies an unauthenticated request to a protected endpoint (401 or 403)', async () => {
    const r = await authed(base, POST_CHALLENGE, 'POST');
    assert.ok(r.status === 401 || r.status === 403, `unauthenticated request must be denied, got ${r.status}`);
  });

  it('lets a CITIZEN demo token submit a challenge (authz passes, status not 401/403)', async () => {
    const r = await authed(base, POST_CHALLENGE, 'POST', 'demo-citizen');
    // Controllers need a database; with none, a 500 (or 201 when one exists) is
    // fine — either proves the challenge:create guard did NOT reject it.
    assert.ok(r.status !== 401 && r.status !== 403, `citizen submit unexpectedly denied with ${r.status}`);
  });

  it('denies a CITIZEN demo token from validating a challenge', async () => {
    const r = await authed(base, POST_TRANSITION, 'POST', 'demo-citizen');
    assert.equal(r.status, 403, `citizen validate should be denied, got ${r.status}`);
  });

  it('denies a CITIZEN demo token from approving a deployment', async () => {
    const r = await authed(base, POST_APPROVE_DEPLOY, 'POST', 'demo-citizen');
    assert.equal(r.status, 403, `citizen approve-deployment should be denied, got ${r.status}`);
  });

  it('does NOT escalate a CITIZEN token via an arbitrary x-demo-role header', async () => {
    const r = await authed(base, POST_TRANSITION, 'POST', 'demo-citizen', { 'x-demo-role': 'SUPER_ADMIN' });
    assert.equal(r.status, 403, `x-demo-role must not escalate; got ${r.status}`);
  });

  it('gives GOV_DEPARTMENT the deployment:approve capability (and CITIZEN not)', async () => {
    const citizen = await authed(base, POST_APPROVE_DEPLOY, 'POST', 'demo-citizen');
    const department = await authed(base, POST_APPROVE_DEPLOY, 'POST', 'demo-department');
    assert.equal(citizen.status, 403);
    assert.ok(department.status !== 401 && department.status !== 403, `GOV_DEPARTMENT approve allowed? got ${department.status}`);
  });

  it('gives GOV_VALIDATOR the challenge:validate capability (and CITIZEN not)', async () => {
    const citizen = await authed(base, POST_TRANSITION, 'POST', 'demo-citizen');
    const validator = await authed(base, POST_TRANSITION, 'POST', 'demo-validator');
    assert.equal(citizen.status, 403);
    assert.ok(validator.status !== 401 && validator.status !== 403, `GOV_VALIDATOR validate allowed? got ${validator.status}`);
  });

  it('rejects an unknown demo token instead of granting a default role', async () => {
    const r = await authed(base, POST_CHALLENGE, 'POST', 'demo-attacker');
    assert.equal(r.status, 401, `unknown demo token should be rejected, got ${r.status}`);
  });

  it('maps every seeded demo user to exactly its seed role(s)', () => {
    const seeded: Record<string, string[]> = {};
    for (const u of DEMO_USERS) seeded[u.firebase_uid] = [...u.roles].sort();
    const mapped: Record<string, string[]> = {};
    for (const [id, roles] of Object.entries(DEMO_IDENTITIES)) mapped[id] = [...roles].sort();

    assert.deepEqual(
      Object.keys(mapped).sort(),
      Object.keys(seeded).sort(),
      'DEMO_IDENTITIES must cover exactly the seeded demo users',
    );
    for (const id of Object.keys(seeded)) {
      assert.deepEqual(mapped[id], seeded[id], `role map for ${id} diverges from seed`);
    }
  });
});