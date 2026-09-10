import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { admin, isFirebaseReady } from '../config/firebase';
import { getConfig } from './config';
import { prisma } from './prisma';

// ── Types ────────────────────────────────────────────────

export interface AuthContext {
  user: { id: string; firebaseUid: string; name?: string };
  roles: string[];
  permissions: Set<string>;
  org?: { id: string; type: string };
  geoScopes: { scopeType: string; districtCode?: string; blockCode?: string }[];
}

// Augment Express Request globally
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      traceId?: string;
      log: Logger;
    }
  }
}

// ── Role -> capability map (mirrors RBAC_MATRIX.md) ────────────

export const ROLE_CAPABILITIES: Record<string, string[]> = {
  SUPER_ADMIN: ['challenge:close', 'challenge:validate', 'challenge:prioritize', 'deployment:approve', 'impact:verify', 'workflow:escalate', 'workflow:resolve'],
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
  UNIVERSITY: ['matching:accept', 'matching:decline'],
  FACULTY: ['proposal:submit', 'proposal:approve', 'proposal:requestRevision'],
  STUDENT: ['proposal:submit'],
  INDUSTRY: ['proposal:submit'],
  CSR: ['proposal:submit'],
  LAB: ['proposal:submit'],
  COMMUNITY_NGO: ['challenge:resubmit', 'challenge:comment'],
  CITIZEN: ['challenge:create', 'challenge:resubmit'],
  PRI: ['challenge:create', 'challenge:resubmit'],
  ULB: ['challenge:create', 'challenge:resubmit'],
};

// ── Controlled demo identity map ─────────────────────────
// Canonical demo bearer tokens — one per seeded demo user. The token *is* the
// uid (`demo-citizen`, hyphenated), so `Authorization: Bearer demo-citizen`
// is the self-contained credential. Roles are derived HERE from the token
// alone — the `x-demo-role` header is never read, so arbitrary escalation is
// impossible. The map keys are hyphenated seed ids (NOT the underscore form
// `demo_citizen`). Valid only when `NODE_ENV=development && DEMO_AUTH_ENABLED`.
//
// NOTE: Must stay hardcoded here rather than importing `prisma/seeds/demo.ts`:
// `src/` is compiled by `tsc` (rootDir ./src) while seeds/tests are excluded
// and run via `tsx` as ESM — a cross-import would break the build. A tsx-run
// spec asserts the two stay consistent.

export const DEMO_IDENTITIES: Readonly<Record<string, readonly string[]>> = {
  'demo-citizen':    ['CITIZEN'],
  'demo-validator':  ['GOV_VALIDATOR'],
  'demo-department': ['GOV_DEPARTMENT'],
  'demo-university': ['UNIVERSITY'],
  'demo-faculty':    ['FACULTY'],
  'demo-student1':   ['STUDENT'],
  'demo-student2':   ['STUDENT'],
  'demo-student3':   ['STUDENT'],
  'demo-industry':   ['INDUSTRY', 'CSR'],
} as const;

export function demoModeEnabled(): boolean {
  const cfg = getConfig();
  return cfg.NODE_ENV === 'development' && cfg.DEMO_AUTH_ENABLED === true;
}

function buildDemoContext(identity: string): AuthContext {
  const roles = [...(DEMO_IDENTITIES[identity] ?? ['CITIZEN'])];
  const permissions = new Set<string>();
  for (const r of roles) for (const c of ROLE_CAPABILITIES[r] ?? []) permissions.add(c);
  return {
    user: { id: identity, firebaseUid: identity },
    roles,
    permissions,
    geoScopes: [{ scopeType: 'DISTRICT' }],
  };
}

// ── Core auth middleware ────────────────────────────────

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  // Controlled demo bypass: an exact `demo-*` token in development+demo mode
  // maps to its seeded role. Unknown `demo-*` tokens fall through to the
  // normal path and are rejected when Firebase is unavailable rather than
  // being granted a default role.
  if (demoModeEnabled() && token.startsWith('demo-')) {
    const identity = DEMO_IDENTITIES[token];
    if (!identity) {
      return res.status(401).json({ ok: false, error: 'AUTHENTICATION_FAILED' });
    }
    req.auth = buildDemoContext(token);
    return next();
  }

  try {
    if (!isFirebaseReady()) {
      // Firebase Admin not configured for this environment (e.g. demo/test mode
      // or missing credentials). We cannot verify a real token — treat the
      // request as unauthenticated rather than failing with a raw 500.
      return res.status(401).json({ ok: false, error: 'AUTHENTICATION_UNAVAILABLE' });
    }
    const decoded = await admin.auth().verifyIdToken(token);
    const dbUser = await prisma.user.findUnique({
      where: { firebase_uid: decoded.uid },
      include: {
        roles: { include: { role: true } },
      },
    });

    if (!dbUser) {
      return res.status(401).json({ ok: false, error: 'AUTHENTICATION_FAILED' });
    }

    const roleNames = [...new Set(dbUser.roles.map((r) => r.role_name as string))];
    const permissions = new Set<string>();
    for (const r of roleNames) {
      for (const c of ROLE_CAPABILITIES[r] ?? []) {
        permissions.add(c);
      }
    }

    const org = dbUser.organization_id
      ? { id: dbUser.organization_id, type: (dbUser as any).organization?.type ?? '' }
      : undefined;

    req.auth = {
      user: { id: dbUser.id, firebaseUid: dbUser.firebase_uid, name: dbUser.name ?? undefined },
      roles: roleNames,
      permissions,
      org,
      geoScopes: [],
    };
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'AUTHENTICATION_FAILED' });
  }
};

// ── RBAC authorizer ─────────────────────────────────────

export function authorize(capability: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = req.auth;
    if (!ctx) {
      return res.status(401).json({ ok: false, error: 'AUTHENTICATION_REQUIRED' });
    }
    if (!ctx.permissions.has(capability)) {
      return res.status(403).json({ ok: false, error: 'FORBIDDEN', capability });
    }
    next();
  };
}
