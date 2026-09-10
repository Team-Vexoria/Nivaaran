/**
 * NIVAARAN — demo-readiness verification.
 *
 * One command (`npm run verify`) that answers a single question before a demo:
 * "Can this environment be rehearsed end-to-end right now, without manual fixes?"
 *
 * It prints a concise, one-line-per-check pass/fail list and exits non-zero the
 * moment any critical check fails — so a developer can spot a broken environment
 * in well under a minute. Checks (mapping to the demo-readiness contract):
 *
 *   1. Backend configuration validity        loadConfig() parsed the environment
 *   2. Database connectivity                  SELECT 1 over the Prisma connection
 *   3. Redis connectivity                     PING
 *   4. Prisma migration status                filesystem structure + applied set
 *   5. Required seed data exists              districts, RBAC, demo users, flood
 *   6. Frontend → backend health endpoint     GET /api/health (the proxy target)
 *   7. API URL & CORS configuration           CLIENT_URL / PORT / live preflight
 *   8. Demo-auth only in development           production+demo is refused
 *   9. Production rejects missing Firebase     enforced at config load
 *
 * SECURITY: this output is safe to paste into a chat or ticket. It never prints
 * DATABASE_URL / REDIS_URL contents, Firebase credentials, or any secret value —
 * only hosts (which exclude credentials), booleans, counts, and migration names.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, existsSync, statSync } from 'node:fs';

import {
  getConfig,
  loadConfig,
  resetConfig,
  isDemoAuthEnabled,
  isFirebaseRequired,
} from '../src/core/config.js';
import { prisma } from '../src/core/prisma.js';
import { getRedis } from '../src/core/redis.js';
import { logger } from '../src/core/logger.js';
import { DEMO_USERS, DEMO_EXPECTED } from '../prisma/seeds/demo.js';

// Silence the application logger for this script's lifetime. The backend's Redis
// and Prisma clients log connection events through pino; during verification a
// down dependency would print a multi-line JSON error blob (and a healthy one a
// "Redis connected" line) above our checklist. Our report uses console.log
// directly, so nothing we intend to show is suppressed — only incidental noise.
logger.level = 'silent';

// ── Result model ─────────────────────────────────────────────────────────────

type Level = 'ok' | 'warn' | 'fail';
interface Check {
  name: string;
  level: Level;
  detail: string;
}
const checks: Check[] = [];

function record(name: string, level: Level, detail: string): void {
  checks.push({ name, level, detail });
}

/** Reject a hung dependency fast so a down service never stalls the checklist. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_res, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

/** Host:port only — `URL.host` deliberately excludes username/password. */
function safeHost(url: string): string {
  try {
    return new URL(url).host || '(no host)';
  } catch {
    return '(unparseable)';
  }
}

/**
 * One concise, credential-safe line from a possibly multi-line dependency error.
 * Prisma errors arrive as a code-frame header + the real cause several lines
 * down; surface the cause, keep it to one line, and never echo a connection URL.
 */
function oneLine(msg: string, max = 140): string {
  const lines = msg.split('\n').map((s) => s.trim()).filter(Boolean);
  const pick =
    lines.find((l) => /(can'?t|cannot) reach|timed out|ECONNREFUSED|connection refused|max retries/i.test(l)) ??
    lines[0] ??
    msg.trim();
  // Defense-in-depth: never echo a connection string even if a driver includes one.
  const scrubbed = pick.replace(/\b(?:postgres(?:ql)?|rediss?):\/\/\S+/gi, '<redacted-url>');
  const flat = scrubbed.replace(/\s+/g, ' ');
  return flat.length > max ? flat.slice(0, max - 1) + '…' : flat;
}

const MIGRATIONS_DIR = path.resolve(fileURLToPath(import.meta.url), '..', '..', 'prisma', 'migrations');
const EXPECTED_MIGRATIONS = [
  '20260903120000_init',
  '20260905000000_model_version',
  '20260905013000_predictive_model',
  '20260905130000_ai_pipeline_concrete',
];

// ── 1. Configuration validity ────────────────────────────────────────────────

function checkConfig(): void {
  try {
    const cfg = getConfig(); // already loaded at import; getConfig throws if not
    const firebase = cfg.serviceAccount ? 'present' : 'absent';
    record(
      'Config',
      'ok',
      `NODE_ENV=${cfg.NODE_ENV} · PORT=${cfg.PORT} · demo-auth=${isDemoAuthEnabled() ? 'on' : 'off'} · ` +
        `firebase=${isFirebaseRequired() ? 'required' : 'not-required'} (${firebase})`,
    );
  } catch (e) {
    record('Config', 'fail', `configuration invalid — ${(e as Error).message}`);
  }
}

// ── 2. Database connectivity ─────────────────────────────────────────────────

async function checkDatabase(): Promise<void> {
  const host = safeHost(getConfig().DATABASE_URL);
  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 5_000, 'Database');
    record('Database', 'ok', `reachable · host=${host}`);
  } catch (e) {
    record('Database', 'fail', `unreachable at ${host} — is Postgres up? (${oneLine((e as Error).message)})`);
  }
}

// ── 3. Redis connectivity ────────────────────────────────────────────────────

async function checkRedis(): Promise<void> {
  const host = safeHost(getConfig().REDIS_URL);
  try {
    const pong = await withTimeout(getRedis().ping(), 5_000, 'Redis');
    if (pong === 'PONG') record('Redis', 'ok', `reachable · host=${host}`);
    else record('Redis', 'fail', `unexpected PING reply "${pong}" from ${host}`);
  } catch (e) {
    record('Redis', 'fail', `unreachable at ${host} — is Redis up? (${oneLine((e as Error).message)})`);
  }
}

// ── 4. Prisma migration status ───────────────────────────────────────────────

async function checkMigrations(): Promise<void> {
  // 4a. Filesystem structure — every migration must be a `<name>/migration.sql`
  // directory. A stray flat `.sql` file or an empty directory is exactly the
  // defect that silently skips a migration on a fresh database.
  let fsNames: string[] = [];
  try {
    const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true });
    const strayFlatSql = entries.filter((e) => e.isFile() && e.name.endsWith('.sql')).map((e) => e.name);
    const dirs = entries.filter((e) => e.isDirectory());
    const emptyOrIncomplete = dirs
      .filter((d) => !existsSync(path.join(MIGRATIONS_DIR, d.name, 'migration.sql')))
      .map((d) => d.name);
    fsNames = dirs
      .filter((d) => existsSync(path.join(MIGRATIONS_DIR, d.name, 'migration.sql')))
      .map((d) => d.name)
      .sort();

    if (strayFlatSql.length) {
      record('Migrations (files)', 'fail', `stray flat .sql (never applied): ${strayFlatSql.join(', ')}`);
    } else if (emptyOrIncomplete.length) {
      record('Migrations (files)', 'fail', `directories without migration.sql: ${emptyOrIncomplete.join(', ')}`);
    } else {
      const missing = EXPECTED_MIGRATIONS.filter((m) => !fsNames.includes(m));
      if (missing.length) record('Migrations (files)', 'warn', `unexpected set on disk (missing ${missing.join(', ')})`);
      else record('Migrations (files)', 'ok', `${fsNames.length} well-formed migration directories`);
    }
  } catch (e) {
    record('Migrations (files)', 'fail', `cannot read ${MIGRATIONS_DIR} — ${oneLine((e as Error).message)}`);
  }

  // 4b. Applied set — compare the filesystem against `_prisma_migrations`.
  try {
    const rows = await withTimeout(
      prisma.$queryRawUnsafe<Array<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }>>(
        'SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at',
      ),
      5_000,
      'Migration table',
    );
    const applied = rows.filter((r) => r.finished_at && !r.rolled_back_at).map((r) => r.migration_name);
    const pending = fsNames.filter((m) => !applied.includes(m));
    if (pending.length) record('Migrations (applied)', 'fail', `${applied.length} applied · PENDING: ${pending.join(', ')} — run prisma migrate deploy`);
    else record('Migrations (applied)', 'ok', `${applied.length}/${fsNames.length} applied · none pending`);
  } catch (e) {
    record('Migrations (applied)', 'fail', `_prisma_migrations unreadable — database not migrated? (${oneLine((e as Error).message)})`);
  }
}

// ── 5. Required seed data ────────────────────────────────────────────────────

async function checkSeedData(): Promise<void> {
  try {
    const demoUids = DEMO_USERS.map((u) => u.firebase_uid);
    const [districts, roles, permissions, demoUsers, challenge, project, evidence, aiRecs, milestones, impact] =
      await withTimeout(
        Promise.all([
          prisma.district.count(),
          prisma.role.count(),
          prisma.permission.count(),
          prisma.user.count({ where: { firebase_uid: { in: demoUids } } }),
          prisma.challenge.findUnique({ where: { id: DEMO_EXPECTED.challengeId }, select: { id: true, status: true } }),
          prisma.project.findUnique({ where: { id: DEMO_EXPECTED.projectId }, select: { id: true } }),
          prisma.challengeEvidence.count({ where: { challenge_id: DEMO_EXPECTED.challengeId } }),
          prisma.aiRecommendation.count({ where: { challenge_id: DEMO_EXPECTED.challengeId } }),
          prisma.milestone.count({ where: { project_id: DEMO_EXPECTED.projectId } }),
          prisma.impactRecord.count({ where: { project_id: DEMO_EXPECTED.projectId } }),
        ]),
        8_000,
        'Seed query',
      );

    const problems: string[] = [];
    if (districts < 24) problems.push(`districts=${districts} (<24)`);
    if (roles < 13) problems.push(`roles=${roles} (<13)`);
    if (permissions < 1) problems.push(`permissions=${permissions}`);
    if (demoUsers < DEMO_EXPECTED.userCount) problems.push(`demo users=${demoUsers}/${DEMO_EXPECTED.userCount}`);
    if (!challenge) problems.push(`flood challenge "${DEMO_EXPECTED.challengeId}" missing`);
    if (!project) problems.push(`flood project "${DEMO_EXPECTED.projectId}" missing`);
    if (evidence < DEMO_EXPECTED.evidenceCount) problems.push(`evidence=${evidence}/${DEMO_EXPECTED.evidenceCount}`);
    if (aiRecs < DEMO_EXPECTED.aiRecommendationCount) problems.push(`ai recs=${aiRecs}/${DEMO_EXPECTED.aiRecommendationCount}`);
    if (milestones < DEMO_EXPECTED.milestoneCount) problems.push(`milestones=${milestones}/${DEMO_EXPECTED.milestoneCount}`);
    if (impact < DEMO_EXPECTED.impactRecordCount) problems.push(`impact=${impact}/${DEMO_EXPECTED.impactRecordCount}`);

    if (problems.length) {
      record('Seed data', 'fail', `${problems.join(', ')} — run the seed pipeline (docker compose up seeds automatically)`);
    } else {
      record(
        'Seed data',
        'ok',
        `districts=${districts} roles=${roles} users=${demoUsers}/${DEMO_EXPECTED.userCount} · ` +
          `flood scenario complete (${challenge!.status})`,
      );
    }
  } catch (e) {
    record('Seed data', 'fail', `seed query failed — database not ready? (${oneLine((e as Error).message)})`);
  }
}

// ── 6 & 7. Health endpoint reachability + CORS/API-URL contract ──────────────

async function checkHealthAndCors(): Promise<void> {
  const cfg = getConfig();

  // 7a. Static proxy contract the frontend depends on (Vite dev-proxy & Nginx
  // both forward /api → backend PORT; the SPA calls a same-origin /api/v1).
  const portOk = cfg.PORT === 5000;
  const clientOk = (() => {
    try {
      return new URL(cfg.CLIENT_URL).protocol.startsWith('http');
    } catch {
      return false;
    }
  })();
  if (portOk && clientOk) {
    record('API/CORS (config)', 'ok', `CLIENT_URL=${cfg.CLIENT_URL} · PORT=${cfg.PORT}`);
  } else {
    const notes = [
      portOk ? '' : `PORT=${cfg.PORT} (frontend proxy targets 5000)`,
      clientOk ? '' : `CLIENT_URL invalid (${cfg.CLIENT_URL})`,
    ].filter(Boolean);
    record('API/CORS (config)', 'warn', notes.join(' · '));
  }

  // 6. The health endpoint is what the frontend's ApiStatus badge and the proxy
  // hit. Reaching it also lets us verify the live CORS header in one round-trip.
  const base = `http://localhost:${cfg.PORT}`;
  const healthUrl = `${base}/api/health`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5_000);
    const res = await fetch(healthUrl, {
      // `Connection: close` so undici does not keep this socket pooled; the
      // script exits by draining the event loop (see main()), and a lingering
      // keep-alive socket would delay (or on Windows, crash) that exit.
      headers: { Origin: cfg.CLIENT_URL, Connection: 'close' },
      signal: controller.signal,
    }).finally(() => clearTimeout(t));
    let db = 'unknown';
    try {
      db = ((await res.json()) as { db?: string }).db ?? 'unknown';
    } catch {
      /* non-JSON body — still reached */
    }
    if (res.status === 200) record('Health endpoint', 'ok', `200 OK · db=${db} · ${healthUrl}`);
    else if (res.status === 503) record('Health endpoint', 'warn', `503 · server up but db=${db} (see Database check)`);
    else record('Health endpoint', 'warn', `unexpected HTTP ${res.status} from ${healthUrl}`);

    // 7b. Live CORS preflight — confirm the API answers the SPA origin.
    try {
      const pf = await fetch(healthUrl, {
        method: 'OPTIONS',
        headers: { Origin: cfg.CLIENT_URL, 'Access-Control-Request-Method': 'GET', Connection: 'close' },
      });
      const acao = pf.headers.get('access-control-allow-origin');
      if (acao === cfg.CLIENT_URL) record('API/CORS (live)', 'ok', `preflight allows ${acao}`);
      else record('API/CORS (live)', 'warn', `preflight ACAO="${acao ?? '(none)'}" ≠ CLIENT_URL`);
    } catch {
      record('API/CORS (live)', 'warn', 'preflight request failed (server reachable but OPTIONS errored)');
    }
  } catch (e) {
    record('Health endpoint', 'fail', `server not reachable at ${healthUrl} — start it (npm run dev) or bring the stack up (${oneLine((e as Error).message)})`);
    record('API/CORS (live)', 'warn', 'skipped — backend not reachable');
  }
}

// ── 8 & 9. Auth-mode invariants (no live services required) ──────────────────
// Re-exercise config loading under simulated environments to prove the two
// safety invariants hold. Runs LAST and fully restores the real singleton, so
// the live checks above always used the real configuration.

function checkAuthInvariants(): void {
  const FIREBASE_KEYS = [
    'FIREBASE_SERVICE_ACCOUNT_JSON', 'FIREBASE_TYPE', 'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_CLIENT_ID', 'FIREBASE_AUTH_URI',
    'FIREBASE_TOKEN_URI', 'FIREBASE_AUTH_PROVIDER_X509_CERT_URL', 'FIREBASE_CLIENT_CERT_URL',
  ];
  const saved = new Map<string, string | undefined>();
  const touched = ['NODE_ENV', 'DEMO_AUTH_ENABLED', ...FIREBASE_KEYS];
  for (const k of touched) saved.set(k, process.env[k]);

  const restore = () => {
    for (const [k, v] of saved) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    resetConfig();
    loadConfig(); // rebuild the real singleton for any later use
  };

  try {
    // 8. Demo auth must be refused in production.
    resetConfig();
    process.env.NODE_ENV = 'production';
    process.env.DEMO_AUTH_ENABLED = 'true';
    let demoRefused = false;
    try {
      loadConfig();
    } catch {
      demoRefused = true;
    }
    record(
      'Demo-auth only in dev',
      demoRefused ? 'ok' : 'fail',
      demoRefused ? 'production + DEMO_AUTH_ENABLED=true is refused' : 'production accepted demo auth — INVARIANT BROKEN',
    );

    // 9. Production must reject missing Firebase credentials.
    resetConfig();
    process.env.NODE_ENV = 'production';
    process.env.DEMO_AUTH_ENABLED = 'false';
    for (const k of FIREBASE_KEYS) delete process.env[k];
    let firebaseEnforced = false;
    try {
      loadConfig();
    } catch (e) {
      firebaseEnforced = /firebase/i.test((e as Error).message) || /required/i.test((e as Error).message);
    }
    record(
      'Prod requires Firebase',
      firebaseEnforced ? 'ok' : 'fail',
      firebaseEnforced ? 'production without Firebase credentials is refused' : 'production started without Firebase — INVARIANT BROKEN',
    );
  } finally {
    restore();
  }
}

// ── Reporting ────────────────────────────────────────────────────────────────

const MARK: Record<Level, string> = { ok: '[ OK ]', warn: '[WARN]', fail: '[FAIL]' };

function report(): number {
  const width = Math.max(...checks.map((c) => c.name.length));
  console.log('');
  console.log('  NIVAARAN demo readiness — ' + new Date().toISOString());
  console.log('  ' + '─'.repeat(60));
  for (const c of checks) {
    console.log(`  ${MARK[c.level]} ${c.name.padEnd(width)}  ${c.detail}`);
  }
  console.log('  ' + '─'.repeat(60));

  const failed = checks.filter((c) => c.level === 'fail').length;
  const warned = checks.filter((c) => c.level === 'warn').length;
  if (failed === 0) {
    console.log(`  READY — ${checks.length - warned}/${checks.length} checks passed${warned ? ` (${warned} warning${warned > 1 ? 's' : ''})` : ''}`);
  } else {
    console.log(`  NOT READY — ${failed} check${failed > 1 ? 's' : ''} failed, ${warned} warning${warned === 1 ? '' : 's'}`);
  }
  console.log('');
  return failed === 0 ? 0 : 1;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  checkConfig();
  await checkDatabase();
  await checkRedis();
  await checkMigrations();
  await checkSeedData();
  await checkHealthAndCors();
  checkAuthInvariants();

  const code = report();

  // Release Prisma and Redis connections so the process can exit on its own.
  // We deliberately do NOT call process.exit(code): forcing an immediate exit
  // while a native socket (e.g. undici's fetch keep-alive from the health check
  // above) is still mid-shutdown can trigger a libuv assertion on Windows and
  // turn a fully-passing run into an exit-code-1 crash. Instead we set
  // process.exitCode and let the event loop drain — the health check already
  // issued its requests with `Connection: close`, so no keep-alive socket is
  // left holding the loop open.
  try {
    await prisma.$disconnect();
  } catch {
    /* engine already failed — a check above reported it */
  }
  try {
    getRedis().disconnect();
  } catch {
    /* redis may never have connected */
  }

  // The event loop should now drain naturally and the process exit with exactly
  // `code` (0 when all checks passed, 1 if any real check failed). unref() means
  // the watchdog below only actually fires if a stray handle keeps the loop
  // alive; a naturally-draining loop exits before it ever reaches 5s.
  process.exitCode = code;
  setTimeout(() => process.exit(process.exitCode ?? 0), 5000).unref();
}

main().catch((e) => {
  console.error('verify-demo crashed:', (e as Error).message);
  process.exit(1);
});
