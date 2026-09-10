// Firebase Admin — lazily initialized so that importing this module can never
// throw when credentials are absent (demo/test modes). Initialization happens
// explicitly at server startup (`initFirebaseAdmin`) and authentication sites
// guard on `isFirebaseReady()` before touching `admin.auth()`.
import {
  initializeApp,
  cert,
  getApps,
  getApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getConfig } from '../core/config';
import { logger } from '../core/logger';

export type { Auth } from 'firebase-admin/auth';

let _appsInitialized = false;

/**
 * Initialize the default Firebase Admin app from the parsed service-account
 * config. Safe to call multiple times (no-ops once initialized). No-ops
 * without error when the environment provides no service account (demo/test
 * mode) — callers must still guard on `isFirebaseReady()`.
 */
export function initFirebaseAdmin(): boolean {
  if (_appsInitialized || getApps().length > 0) return true;

  const config = getConfig();
  const serviceAccount = config.serviceAccount;

  if (!serviceAccount || Object.keys(serviceAccount).length === 0) {
    logger.warn(
      'Firebase Admin not initialized: no service-account credentials present. ' +
        'Authentication will be restricted until valid credentials are configured.',
    );
    return false;
  }

  try {
    initializeApp({ credential: cert(serviceAccount as any), projectId: config.FIREBASE_PROJECT_ID });
    _appsInitialized = true;
    logger.info(`Firebase Admin initialized (project: ${config.FIREBASE_PROJECT_ID ?? 'default'})`);
    return true;
  } catch (err) {
    // Never leak credential material into logs — only the generic message.
    logger.error({ err: (err as Error).message }, 'Firebase Admin initialization failed');
    return false;
  }
}

/** True once the default Firebase Admin app is usable for token verification. */
export function isFirebaseReady(): boolean {
  return _appsInitialized && getApps().length > 0;
}

/** @internal — reset the initialized flag (tests). */
export function _resetFirebaseForTests(): void {
  _appsInitialized = false;
}

/** Resolve the default Firebase Auth instance (throws if not initialized). */
export function getAdminAuth() {
  return getAuth(getApp());
}

// ── Legacy import compatibility ──────────────────────────────────────────────
// Existing callers do `import { admin } from '../config/firebase'` and call
// `admin.auth().verifyIdToken(...)`. Keep that shape working by lazily exposing
// a thin `admin` facade whose `.auth()` throws a clear error if Firebase was
// never initialized. New code should prefer `isFirebaseReady()` + `getAdminAuth()`.
export const admin = {
  auth(): ReturnType<typeof getAdminAuth> {
    if (!isFirebaseReady()) {
      throw new Error(
        'Firebase Admin is not initialized. Start the server with initFirebaseAdmin() (or run in demo mode) before calling admin.auth().',
      );
    }
    return getAdminAuth();
  },
};