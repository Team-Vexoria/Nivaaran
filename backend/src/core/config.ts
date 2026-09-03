import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

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
});

const FirebaseConfig = z.object({
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

const ConfigSchema = DatabaseConfig.merge(RedisConfig).merge(AppConfig).merge(FirebaseConfig);

// ── Types ────────────────────────────────────────────────────────────────────

export type DatabaseConfigT = z.infer<typeof DatabaseConfig>;
export type RedisConfigT = z.infer<typeof RedisConfig>;
export type AppConfigT = z.infer<typeof AppConfig>;
export type FirebaseConfigT = z.infer<typeof FirebaseConfig>;
export type ConfigT = z.infer<typeof ConfigSchema>;

// ── Frozen config singleton ──────────────────────────────────────────────────

let _config: ConfigT | null = null;

export function loadConfig(): ConfigT {
  if (_config) return _config;
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Config validation failed: ${details}`);
  }
  _config = Object.freeze({ ...result.data });
  return _config;
}

export function getConfig(): ConfigT {
  if (!_config) throw new Error('Config not loaded — call loadConfig() first');
  return _config;
}
