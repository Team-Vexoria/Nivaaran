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

const FirebaseInputConfig = z.object({
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().min(10, 'FIREBASE_SERVICE_ACCOUNT_JSON must be a valid JSON string'),
});

const ConfigSchema = DatabaseConfig.merge(RedisConfig).merge(AppConfig).merge(FirebaseInputConfig);

// ── Types ────────────────────────────────────────────────────────────────────

export type DatabaseConfigT = z.infer<typeof DatabaseConfig>;
export type RedisConfigT = z.infer<typeof RedisConfig>;
export type AppConfigT = z.infer<typeof AppConfig>;

export interface FirebaseConfig {
  serviceAccount: Record<string, unknown>;
}

export interface ConfigT {
  DATABASE_URL: string;
  REDIS_URL: string;
  PORT: number;
  CLIENT_URL: string;
  NODE_ENV: 'development' | 'test' | 'production';
  serviceAccount: Record<string, unknown>;
}

// ── Frozen config singleton ──────────────────────────────────────────────────

let _config: ConfigT | null = null;

export function loadConfig(): ConfigT {
  if (_config) return _config;
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Config validation failed: ${details}`);
  }
  
  // Parse Firebase service account JSON
  let serviceAccount: Record<string, unknown> = {};
  try {
    serviceAccount = JSON.parse(result.data.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON parse failed: ' + (e as Error).message);
  }
  
  _config = Object.freeze({
    DATABASE_URL: result.data.DATABASE_URL,
    REDIS_URL: result.data.REDIS_URL,
    PORT: result.data.PORT,
    CLIENT_URL: result.data.CLIENT_URL,
    NODE_ENV: result.data.NODE_ENV,
    serviceAccount,
  });
  return _config;
}

export function getConfig(): ConfigT {
  if (!_config) throw new Error('Config not loaded — call loadConfig() first');
  return _config;
}
