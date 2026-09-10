// NIVAARAN demo-readiness — hermetic tests.
//
// These run in CI with NO live services (no Postgres, Redis, or Firebase). They
// lock down the three failure classes that have actually broken a clean-environment
// rehearsal before, and that a live-only check would miss until demo day:
//
//   1. Migration directory structure — a stray flat `.sql` or an empty migration
//      directory silently skips a migration on a fresh database.
//   2. Demo dataset referential integrity — a dangling organization_id or a field
//      that isn't in the schema turns the seed into a mid-transaction crash.
//   3. The HTTP contract the frontend depends on — CORS for the SPA origin, a
//      public /api/health, and the JSON error envelope.
//
// The two auth-mode invariants (demo-auth only in dev; production requires
// Firebase) are already covered by config.spec.ts and are intentionally not
// duplicated here. Live connectivity + seed-count checks live in
// scripts/verify-demo.ts (`npm run verify`), which is run at rehearsal time.

// Pin test mode before importing anything that transitively loads config.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import { app } from '../src/app.js';
import { getConfig, loadConfig } from '../src/core/config.js';
import { prisma } from '../src/core/prisma.js';
import { DEMO_USERS, DEMO_ORGS, EVIDENCE, DEMO_EXPECTED } from '../prisma/seeds/demo.js';

// Captured at import: `app` fixed its CORS origin from this same config when it
// was built, so the preflight assertion below compares against the live value.
const CLIENT_URL: string = (() => {
  try {
    return getConfig().CLIENT_URL;
  } catch {
    return loadConfig().CLIENT_URL;
  }
})();

const MIGRATIONS_DIR = path.resolve(fileURLToPath(import.meta.url), '..', '..', 'prisma', 'migrations');
const EXPECTED_MIGRATIONS = [
  '20260903120000_init',
  '20260905000000_model_version',
  '20260905013000_predictive_model',
  '20260905130000_ai_pipeline_concrete',
];

// ── 1. Migration directory structure ─────────────────────────────────────────

describe('prisma migration directory structure', () => {
  it('contains only well-formed <name>/migration.sql directories (no stray flat .sql)', () => {
    const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true });

    const strayFlatSql = entries.filter((e) => e.isFile() && e.name.endsWith('.sql')).map((e) => e.name);
    assert.deepEqual(
      strayFlatSql,
      [],
      `flat .sql files at the migrations root are never applied by "prisma migrate deploy": ${strayFlatSql.join(', ')}`,
    );

    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    const withoutSql = dirs.filter((d) => !existsSync(path.join(MIGRATIONS_DIR, d, 'migration.sql')));
    assert.deepEqual(
      withoutSql,
      [],
      `migration directories missing migration.sql stall a fresh migrate: ${withoutSql.join(', ')}`,
    );
  });

  it('has exactly the four expected sequential migrations on disk', () => {
    const dirs = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(path.join(MIGRATIONS_DIR, e.name, 'migration.sql')))
      .map((e) => e.name)
      .sort();
    assert.deepEqual(dirs, [...EXPECTED_MIGRATIONS].sort(), 'migration set on disk must match the expected sequence');
  });
});

// ── 2. Demo dataset referential integrity (static — no database) ─────────────

describe('demo dataset referential integrity', () => {
  const orgIds = new Set(DEMO_ORGS.map((o) => o.id));

  it('DEMO_EXPECTED counts track the exported arrays', () => {
    assert.equal(DEMO_EXPECTED.userCount, DEMO_USERS.length);
    assert.equal(DEMO_EXPECTED.orgCount, DEMO_ORGS.length);
    assert.equal(DEMO_EXPECTED.evidenceCount, EVIDENCE.length);
  });

  it('every user organization_id resolves to a seeded organization', () => {
    // Guards the class of the `gov-anchi-urban` typo: a dangling FK aborts the
    // whole seed transaction on a fresh database.
    for (const u of DEMO_USERS) {
      if (u.organization_id != null) {
        assert.ok(orgIds.has(u.organization_id), `user ${u.id} references missing org "${u.organization_id}"`);
      }
    }
  });

  it('organization, user, and firebase_uid identifiers are unique', () => {
    assert.equal(new Set(DEMO_ORGS.map((o) => o.id)).size, DEMO_ORGS.length, 'duplicate org id');
    assert.equal(new Set(DEMO_USERS.map((u) => u.id)).size, DEMO_USERS.length, 'duplicate user id');
    assert.equal(new Set(DEMO_USERS.map((u) => u.firebase_uid)).size, DEMO_USERS.length, 'duplicate firebase_uid');
  });

  it('every evidence uploader is a seeded user and every item targets the flood challenge', () => {
    const userIds = new Set(DEMO_USERS.map((u) => u.id));
    for (const ev of EVIDENCE) {
      assert.ok(userIds.has(ev.uploader_id), `evidence uploader "${ev.uploader_id}" is not a seeded user`);
      assert.equal(ev.challenge_id, DEMO_EXPECTED.challengeId, 'evidence must attach to the flood challenge');
    }
  });

  it('evidence objects carry only ChallengeEvidence columns (no phantom "description")', () => {
    // Guards the class of the removed `description` field, which is not a column
    // on ChallengeEvidence and made the seed throw a validation error.
    const ALLOWED = new Set([
      'challenge_id', 'type', 'storage_ref', 'mime_type', 'size_bytes', 'meta', 'is_private', 'uploader_id',
    ]);
    for (const ev of EVIDENCE) {
      assert.ok(!('description' in ev), 'ChallengeEvidence has no "description" column');
      for (const key of Object.keys(ev)) {
        assert.ok(ALLOWED.has(key), `evidence has unexpected field "${key}" not on ChallengeEvidence`);
      }
    }
  });

  it('the index-based evidence id scheme yields unique ids', () => {
    // Mirrors seedEvidence(): a type-based id collided when two PHOTO records
    // shared a challenge. The index makes each id unique.
    const ids = EVIDENCE.map((ev, i) => `${ev.challenge_id}-evidence-${i}`);
    assert.equal(new Set(ids).size, EVIDENCE.length, 'evidence ids must be unique');
  });
});

// ── 3. HTTP contract: CORS, public health, error envelope ────────────────────

describe('HTTP contract (in-process server, no live database required)', () => {
  let server: Server;
  let baseUrl = '';

  before(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    // Release the Prisma engine so the test process exits promptly (the health
    // GET above opens a connection when a database is reachable).
    await prisma.$disconnect().catch(() => {});
  });

  it('answers a CORS preflight for the SPA origin, with credentials enabled', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: { Origin: CLIENT_URL, 'Access-Control-Request-Method': 'GET' },
    });
    assert.ok(res.status === 204 || res.status === 200, `unexpected preflight status ${res.status}`);
    assert.equal(res.headers.get('access-control-allow-origin'), CLIENT_URL, 'ACAO must echo the configured client origin');
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true', 'credentialed CORS is required for the SPA');
  });

  it('serves /api/health unauthenticated with the documented JSON contract', async () => {
    // No Authorization header — the health probe must be reachable by the proxy
    // and the frontend badge without a token. 200 when the DB is up, 503 when not;
    // the shape is identical either way.
    const res = await fetch(`${baseUrl}/api/health`);
    assert.ok(res.status === 200 || res.status === 503, `health returned unexpected ${res.status}`);
    const body = (await res.json()) as Record<string, unknown>;
    assert.equal(body.service, 'NIVAARAN Backend API');
    assert.equal(body.status, res.status === 200 ? 'OK' : 'UNAVAILABLE');
    assert.equal(body.db, res.status === 200 ? 'Connected' : 'Disconnected');
    assert.equal(typeof body.timestamp, 'string');
  });

  it('returns the JSON error envelope for an unknown endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/v1/__does_not_exist__`);
    assert.equal(res.status, 404);
    const body = (await res.json()) as { ok: boolean; error: { code: string } };
    assert.equal(body.ok, false);
    assert.equal(body.error.code, 'NOT_FOUND');
  });
});
