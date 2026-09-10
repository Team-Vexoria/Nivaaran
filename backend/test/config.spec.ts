// NIVAARAN config validation — demo mode, production enforcement, and secret-leak
// protection. These tests only exercise `core/config.ts` (pure environment
// parsing) so they run without Redis, Prisma, or Firebase.

// Ensure the config module auto-loads in test mode (dotenv will not override an
// already-set NODE_ENV). This must happen BEFORE importing the module.
process.env.NODE_ENV = 'test';

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Imported after NODE_ENV is pinned so its import-time auto-load is in test mode.
import {
  getConfig,
  loadConfig,
  resetConfig,
  isDemoAuthEnabled,
  isFirebaseRequired,
} from '../src/core/config.js';

const FIREBASE_FLAT_KEYS = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_AUTH_URI',
  'FIREBASE_TOKEN_URI',
  'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
  'FIREBASE_CLIENT_CERT_URL',
  'FIREBASE_SERVICE_ACCOUNT_JSON',
] as const;

// Clean baseline: test env, no Firebase, no PORT, no demo flag. The module's
// import-time auto-load already ran; dotenv only runs once, so mutating
// `process.env` now affects subsequent `loadConfig()` calls.
function cleanEnv() {
  process.env.NODE_ENV = 'test';
  delete process.env.PORT;
  delete process.env.DEMO_AUTH_ENABLED;
  for (const k of FIREBASE_FLAT_KEYS) delete process.env[k];
}
cleanEnv();

/** Apply env overrides for one synchronous operation, preserving prior values. */
function withEnv<T>(
  overrides: Record<string, string | null>,
  fn: () => T,
): T {
  const keys = Object.keys(overrides);
  const prev = new Map<string, string | undefined>();
  for (const k of keys) {
    prev.set(k, process.env[k]);
    if (overrides[k] === null) delete process.env[k];
    else process.env[k] = overrides[k] as string;
  }
  try {
    return fn();
  } finally {
    for (const k of keys) {
      const wasSet = prev.has(k) && prev.get(k) !== undefined;
      if (wasSet) process.env[k] = prev.get(k) as string;
      else delete process.env[k];
    }
  }
}

describe('config validation (demo mode & Firebase enforcement)', () => {
  beforeEach(() => resetConfig());
  afterEach(() => {
    cleanEnv();
    resetConfig();
  });

  it('starts in demo mode (development + DEMO_AUTH_ENABLED=true) with no Firebase credentials', () => {
    const cfg = withEnv({ NODE_ENV: 'development', DEMO_AUTH_ENABLED: 'true' }, () => loadConfig());
    assert.equal(cfg.NODE_ENV, 'development');
    assert.equal(cfg.DEMO_AUTH_ENABLED, true);
    assert.equal(cfg.serviceAccount, null);
    assert.equal(isFirebaseRequired(), false, 'demo mode must not require Firebase');
    assert.equal(isDemoAuthEnabled(), true);
  });

  it('refuses production startup when Firebase credentials are absent', () => {
    assert.throws(
      () => withEnv({ NODE_ENV: 'production', DEMO_AUTH_ENABLED: 'false' }, () => loadConfig()),
      /Firebase Admin credentials are required/,
    );
  });

  it('production rejects the demo-auth escape hatch outright', () => {
    assert.throws(
      () => withEnv({ NODE_ENV: 'production', DEMO_AUTH_ENABLED: 'true' }, () => loadConfig()),
      /DEMO_AUTH_ENABLED=true is not allowed when NODE_ENV=production/,
    );
  });

  it('loads in production with valid service-account JSON and marks Firebase required', () => {
    const sa = JSON.stringify({
      type: 'service_account', project_id: 'proj-1', private_key: 'KEY', client_email: 'a@b.iam',
      client_id: 'cid', private_key_id: 'pkid',
    });
    const cfg = withEnv(
      { NODE_ENV: 'production', DEMO_AUTH_ENABLED: 'false', FIREBASE_SERVICE_ACCOUNT_JSON: sa },
      () => loadConfig(),
    );
    assert.equal(isFirebaseRequired(), true);
    assert.ok(cfg.serviceAccount);
    assert.equal(cfg.serviceAccount.project_id, 'proj-1');
  });

  it('production with malformed JSON throws a safe error that never leaks the value', () => {
    const secretMarker = 'SUPER_SECRET_MARKER_9821';
    const raw = `{ this is not valid json ${secretMarker} }`;
    assert.throws(
      () => withEnv(
        { NODE_ENV: 'production', DEMO_AUTH_ENABLED: 'false', FIREBASE_SERVICE_ACCOUNT_JSON: raw },
        () => loadConfig(),
      ),
      (err: unknown) => {
        const msg = String((err as Error).message);
        return !msg.includes(secretMarker) && /could not be parsed/i.test(msg);
      },
    );
  });

  it('production with "{}" JSON throws clearly without leaking anything', () => {
    assert.throws(
      () => withEnv(
        { NODE_ENV: 'production', DEMO_AUTH_ENABLED: 'false', FIREBASE_SERVICE_ACCOUNT_JSON: '{}' },
        () => loadConfig(),
      ),
      (err: unknown) => /is empty or missing required fields/i.test(String((err as Error).message)),
    );
  });

  it('production with flat FIREBASE_* fields assembles a service account and decodes \\n in the private key', () => {
    const cfg = withEnv(
      {
        NODE_ENV: 'production', DEMO_AUTH_ENABLED: 'false',
        FIREBASE_TYPE: 'service_account', FIREBASE_PROJECT_ID: 'flat-proj',
        FIREBASE_PRIVATE_KEY_ID: 'pkid', FIREBASE_PRIVATE_KEY: 'LINE1\\nLINE2',
        FIREBASE_CLIENT_EMAIL: 'sa@proj.iam.gserviceaccount.com', FIREBASE_CLIENT_ID: 'cid',
      },
      () => loadConfig(),
    );
    assert.ok(cfg.serviceAccount);
    assert.equal(cfg.serviceAccount.private_key, 'LINE1\nLINE2', '\\n escapes must decode to real newlines');
    assert.equal(cfg.serviceAccount.project_id, 'flat-proj');
  });

  it('development with demo auth OFF still requires Firebase credentials', () => {
    assert.throws(
      () => withEnv({ NODE_ENV: 'development', DEMO_AUTH_ENABLED: 'false' }, () => loadConfig()),
      /required/i,
    );
  });

  it('test mode loads without Firebase credentials', () => {
    const cfg = withEnv({ NODE_ENV: 'test', DEMO_AUTH_ENABLED: 'false' }, () => loadConfig());
    assert.equal(cfg.NODE_ENV, 'test');
    assert.equal(isFirebaseRequired(), false);
    assert.equal(cfg.serviceAccount, null);
  });

  it('parses a false boolean flag correctly and defaults PORT to 5000', () => {
    const cfg = withEnv({ NODE_ENV: 'test', DEMO_AUTH_ENABLED: 'false' }, () => loadConfig());
    assert.equal(cfg.DEMO_AUTH_ENABLED, false, 'DEMO_AUTH_ENABLED=false must parse to a real false');
    assert.equal(cfg.PORT, 5000, 'unset PORT should default to 5000');
  });

  it('returns the same frozen instance across repeated loadConfig() calls', () => {
    const a = withEnv({ NODE_ENV: 'test' }, () => loadConfig());
    const b = withEnv({ NODE_ENV: 'test' }, () => loadConfig());
    assert.equal(a, b, 'singleton should be stable');
    assert.ok(Object.isFrozen(a));
  });

  it('exposes the config only through getConfig() after a successful load', () => {
    withEnv({ NODE_ENV: 'test' }, () => loadConfig());
    assert.equal(getConfig().NODE_ENV, 'test');
  });

  it('.env.example documents the demo-auth and Firebase contract', () => {
    const example = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
    assert.ok(example.includes('DEMO_AUTH_ENABLED'), '.env.example must document DEMO_AUTH_ENABLED');
    assert.ok(example.includes('FIREBASE_SERVICE_ACCOUNT_JSON'), '.env.example must document FIREBASE_SERVICE_ACCOUNT_JSON');
    assert.ok(/never commit/i.test(example), '.env.example must warn about committing secrets');
  });
});