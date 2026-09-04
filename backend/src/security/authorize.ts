// authorize(capability, resolver) — evaluates Role + Organization + Geographic Scope + Resource Ownership + Workflow State
import { AuthContext } from '../core/auth';

export interface ResolverResult {
  allowed: boolean;
  reason?: string;
  missingScopes?: string[];
}

export interface AuthorizeOptions {
  capability: string;
  resolver?: (ctx: AuthContext, resource: any) => ResolverResult;
}

export function authorize(options: AuthorizeOptions) {
  return (req: any, res: any, next: any) => {
    const ctx: AuthContext = req.auth || {
      roles: [],
      permissions: new Set(),
      geoScopes: [],
      user: { id: '', firebaseUid: '' },
    };
    const roles: string[] = ctx.roles || [];
    const perms: Set<string> = ctx.permissions || new Set();
    const orgId: string | null = ctx.org?.id || null;

    // 1. Role check
    const hasRole =
      roles.includes('SUPER_ADMIN') ||
      roles.includes('Platform Super Admin') ||
      perms.has('*');

    // 2. Capability check
    const hasCap = hasRole || perms.has(options.capability);
    if (!hasCap) {
      return res.status(403).json({
        ok: false,
        error: { code: 'FORBIDDEN', message: `Missing capability: ${options.capability}` },
      });
    }

    // 3. Organizational scope
    if (orgId === null && !hasRole && req.resource?.org_id) {
      return res.status(403).json({
        ok: false,
        error: { code: 'ORG_SCOPE', message: 'Organizational scope required' },
      });
    }

    // 4. Geographic scope (district/block/panchayat)
    const geoScope = req.params?.districtCode || req.body?.district_code || req.query?.district;
    const allowedDistricts = (ctx.geoScopes || []).map((g) => g.districtCode).filter(Boolean);
    if (geoScope && allowedDistricts.length > 0 && !allowedDistricts.includes(geoScope) && !hasRole) {
      return res.status(403).json({
        ok: false,
        error: { code: 'GEO_SCOPE', message: 'District scope denied' },
      });
    }

    // 5. Resource ownership / workflow-state (via resolver if provided)
    if (options.resolver && req.resource) {
      const r = options.resolver(ctx, req.resource);
      if (!r.allowed) {
        return res.status(403).json({
          ok: false,
          error: {
            code: 'RESOURCE_SCOPE',
            message: r.reason || 'Resource access denied',
            missingScopes: r.missingScopes,
          },
        });
      }
    }

    // 6. Workflow-state check (challenge status must be in allowed set for action)
    const status = req.resource?.status || req.body?.status;
    if (status && req.allowedStatuses && !req.allowedStatuses.includes(status)) {
      return res.status(409).json({
        ok: false,
        error: { code: 'WORKFLOW_STATE', message: 'Invalid workflow state for this action' },
      });
    }

    return next();
  };
}
