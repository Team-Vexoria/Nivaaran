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
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().min(10, 'FIREBASE_SERVICE_ACCOUNT_JSON must be a valid JSON string'),
}).transform((data) => {
// @ts-ignore
  try { return { serviceAccount: JSON.parse(data.FIREBASE_SERVICE_ACCOUNT_JSON) }; } catch (e) { throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON parse failed: ' + e.message); }
});
// @ts-ignore

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
