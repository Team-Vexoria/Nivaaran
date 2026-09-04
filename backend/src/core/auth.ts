import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { admin } from '../config/firebase';
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

// ── Helpers ──────────────────────────────────────────────

function isDevMode(req: Request): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    !!req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer demo_')
  );
}

function buildDevContext(req: Request): AuthContext {
  const role = (req.headers['x-demo-role'] as string) || 'Citizen';
  return {
    user: { id: req.headers.authorization?.replace('Bearer ', '') ?? 'demo', firebaseUid: 'demo' },
    roles: [role],
    permissions: new Set(ROLE_CAPABILITIES[role] ?? []),
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

  // Dev-mode bypass
  if (isDevMode(req)) {
    req.auth = buildDevContext(req);
    return next();
  }

  try {
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
