import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// ── Environment loading ──────────────────────────────────────────────────────
// Load the backend's own `.env` from a deterministic location so startup is
// identical regardless of the working directory (Windows, Docker, CI, tests).
// `path.resolve(__dirname, '..', '..', '.env')` resolves correctly both from
// the compiled output (`dist/core/config.js` → `backend/.env`) and from
// `tsx`/`node --test` source runners (`src/core/config.ts` → `backend/.env`).
//
// dotenv does NOT overwrite variables that are already present in
// `process.env`, so values injected by the environment (CI, Docker, the test
// runner) always win over the file — and real secrets are never read from the
// file when the environment provides them.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// A helper that parses a strictly boolean flag (accepts "true"/"false"), so
// that `DEMO_AUTH_ENABLED=false` behaves like a real boolean rather than the
// truthy string that `z.coerce.boolean()` would produce.
const boolFromEnv = z.preprocess(
  (v) => (v === undefined ? false : String(v).toLowerCase() === 'true'),
  z.boolean(),
);

// ── Zod schemas ──────────────────────────────────────────────────────────────

const DatabaseConfig = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
});

const RedisConfig = z.object({
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional().default('redis://localhost:6379'),
});

const AppConfig = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url('CLIENT_URL must be a valid URL').default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Demo auth is a controlled escape hatch for local development only:
  //   NODE_ENV=development  AND  DEMO_AUTH_ENABLED=true
  // Inside that mode the backend starts with NO Firebase credentials.
  DEMO_AUTH_ENABLED: boolFromEnv.default(false),
});

// Firebase credentials are validated separately from the "always required"
// fields because their presence is mode-dependent.
const FirebaseInputConfig = z.object({
  // Single service-account JSON blob (preferred form for local dev / tests).
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  // Flat per-field form (portable across Docker/Kubernetes without a JSON blob).
  FIREBASE_TYPE: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY_ID: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_CLIENT_ID: z.string().optional(),
  FIREBASE_AUTH_URI: z.string().optional(),
  FIREBASE_TOKEN_URI: z.string().optional(),
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: z.string().optional(),
  FIREBASE_CLIENT_CERT_URL: z.string().optional(),
});

const ConfigSchema = DatabaseConfig.merge(RedisConfig).merge(AppConfig).merge(FirebaseInputConfig);

// ── Types ────────────────────────────────────────────────────────────────────

export type DatabaseConfigT = z.infer<typeof DatabaseConfig>;
export type RedisConfigT = z.infer<typeof RedisConfig>;
export type AppConfigT = z.infer<typeof AppConfig>;

export interface ConfigT {
  DATABASE_URL: string;
  REDIS_URL: string;
  PORT: number;
  CLIENT_URL: string;
  NODE_ENV: 'development' | 'test' | 'production';
  DEMO_AUTH_ENABLED: boolean;
  /** Parsed Firebase service-account object, or `null` when the environment
   *  provides none (valid only when Firebase is not required). */
  serviceAccount: Record<string, unknown> | null;
  /** Populated when the flat `FIREBASE_*` field form is used. */
  FIREBASE_PROJECT_ID?: string;
}

// ── Demo / Firebase mode helpers ─────────────────────────────────────────────

/**
 * True only inside the controlled demo mode:
 *   NODE_ENV=development  AND  DEMO_AUTH_ENABLED=true
 * In this mode the backend starts without any Firebase credentials and auth is
 * satisfied by the `Bearer demo-*` bypass in `core/auth.ts`.
 */
export function isDemoAuthEnabled(): boolean {
  const cfg = tryGetConfig();
  return cfg ? cfg.NODE_ENV === 'development' && cfg.DEMO_AUTH_ENABLED === true : false;
}

/**
 * Whether startup REQUIRES valid Firebase Admin credentials:
 *   • production                → always required (auth must be real)
 *   • development (non-demo)    → required (auth is expected to work)
 *   • development demo / test   → NOT required (controlled bypass)
 */
export function isFirebaseRequired(): boolean {
  const cfg = tryGetConfig();
  if (!cfg) return false;
  return cfg.NODE_ENV === 'production' || (cfg.NODE_ENV === 'development' && cfg.DEMO_AUTH_ENABLED === false);
}

function tryGetConfig(): ConfigT | null {
  return _config;
}

// ── Firehase credential assembly ─────────────────────────────────────────────

const FIREBASE_FLAT_FIELDS: ReadonlyArray<{ key: string; firebaseKey: string }> = [
  { key: 'FIREBASE_TYPE', firebaseKey: 'type' },
  { key: 'FIREBASE_PROJECT_ID', firebaseKey: 'project_id' },
  { key: 'FIREBASE_PRIVATE_KEY_ID', firebaseKey: 'private_key_id' },
  { key: 'FIREBASE_PRIVATE_KEY', firebaseKey: 'private_key' },
  { key: 'FIREBASE_CLIENT_EMAIL', firebaseKey: 'client_email' },
  { key: 'FIREBASE_CLIENT_ID', firebaseKey: 'client_id' },
  { key: 'FIREBASE_AUTH_URI', firebaseKey: 'auth_uri' },
  { key: 'FIREBASE_TOKEN_URI', firebaseKey: 'token_uri' },
  { key: 'FIREBASE_AUTH_PROVIDER_X509_CERT_URL', firebaseKey: 'auth_provider_x509_cert_url' },
  { key: 'FIREBASE_CLIENT_CERT_URL', firebaseKey: 'client_cert_url' },
];

/**
 * Build the Firebase service-account object (or `null`) from the environment.
 * Order of precedence:
 *   1. `FIREBASE_SERVICE_ACCOUNT_JSON` — must parse to a non-empty JSON object.
 *   2. Flat `FIREBASE_*` fields — assembled field-by-field (Kubernetes-friendly).
 * Returns `null` when no credentials are present. Throws with a safe message
 * (never exposing credential values) when invalid credentials are supplied for
 * a mode that requires them.
 */
function buildServiceAccount(
  env: Record<string, string | undefined>,
  requireFirebase: boolean,
): Record<string, unknown> | null {
  const rawJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (rawJson && rawJson.trim() !== '') {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      if (requireFirebase) {
        throw new Error(
          'FIREBASE_SERVICE_ACCOUNT_JSON could not be parsed as JSON. Supply a valid service-account object or use flat FIREBASE_* fields.',
        );
      }
      return null;
    }
    const obj = parsed as Record<string, unknown>;
    if (obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0) {
      return obj;
    }
    if (requireFirebase) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON is empty or missing required fields. Provide a complete Firebase service-account object.',
      );
    }
    return null;
  }

  // Fall back to flat fields.
  const hasFlatFields = FIREBASE_FLAT_FIELDS.some(({ key }) => (env[key] ?? '') !== '');
  if (hasFlatFields) {
    const assembled: Record<string, unknown> = {};
    for (const { key, firebaseKey } of FIREBASE_FLAT_FIELDS) {
      const val = env[key] ?? '';
      if (val !== '') {
        // Decode literal `\n` escapes in the private key (common when the key
        // is provided via a single-line env var).
        assembled[firebaseKey] = firebaseKey === 'private_key' ? val.replace(/\\n/g, '\n') : val;
      }
    }
    const complete =
      assembled.type &&
      assembled.project_id &&
      assembled.private_key &&
      assembled.client_email &&
      assembled.private_key_id &&
      assembled.client_id;
    if (complete) return assembled;
    if (requireFirebase) {
      throw new Error(
        'Incomplete Firebase configuration: supply either a valid FIREBASE_SERVICE_ACCOUNT_JSON or all of FIREBASE_TYPE, FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY_ID, FIREBASE_CLIENT_ID.',
      );
    }
    return null;
  }

  if (requireFirebase) {
    throw new Error(
      'Firebase Admin credentials are required in production. Set FIREBASE_SERVICE_ACCOUNT_JSON (or flat FIREBASE_* fields). See .env.example.',
    );
  }
  return null;
}

// ── Frozen config singleton ──────────────────────────────────────────────────

let _config: ConfigT | null = null;

export function loadConfig(): ConfigT {
  if (_config) return _config;

  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    // Never echo secret-bearing field values here — only field names.
    const issues = result.error.issues.map((i) => i.path.join('.'));
    const unique = [...new Set(issues)].join(', ');
    throw new Error(`Config validation failed for: ${unique || 'unknown fields'}`);
  }

  const env = result.data;
  const requireFirebase = env.NODE_ENV === 'production' || (env.NODE_ENV === 'development' && env.DEMO_AUTH_ENABLED === false);

  // Refuse to combine demo mode with production: demo exists for local dev only.
  if (env.NODE_ENV === 'production' && env.DEMO_AUTH_ENABLED === true) {
    throw new Error(
      'DEMO_AUTH_ENABLED=true is not allowed when NODE_ENV=production. Demo auth is a development-only escape hatch — set DEMO_AUTH_ENABLED=false (or remove it) for production.',
    );
  }

  // buildServiceAccount treats every field as a raw string. Read them straight
  // from process.env: the Firebase fields pass through Zod untouched, while the
  // parsed config carries a numeric PORT that does not fit a string-only map.
  const serviceAccount = buildServiceAccount(process.env, requireFirebase);

  _config = Object.freeze({
    DATABASE_URL: env.DATABASE_URL,
    REDIS_URL: env.REDIS_URL,
    PORT: env.PORT,
    CLIENT_URL: env.CLIENT_URL,
    NODE_ENV: env.NODE_ENV,
    DEMO_AUTH_ENABLED: env.DEMO_AUTH_ENABLED,
    serviceAccount,
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID || (serviceAccount?.project_id as string | undefined),
  });
  return _config;
}

export function getConfig(): ConfigT {
  if (!_config) throw new Error('Config not loaded — call loadConfig() first');
  return _config;
}

/**
 * Reset the singleton (test helper only). After calling, `loadConfig()` will
 * re-read the environment. Callers should save/restore `process.env` around
 * the re-load so it uses the intended values.
 */
export function resetConfig(): void {
  _config = null;
}

// ── Load once at import ──────────────────────────────────────────────────────
// `config.ts` is a leaf module (imports only path/dotenv/zod), so self-loading
// here keeps a single source of truth and lets consumers read `getConfig()`
// safely whether they are imported by `index.ts`, `app.ts`, or a test spec
// directly. Explicit `loadConfig()` calls elsewhere are redundant no-ops; tests
// use `resetConfig()` + `loadConfig()` to re-read a controlled environment.
loadConfig();