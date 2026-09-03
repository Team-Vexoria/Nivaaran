import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';
import { prisma } from './prisma';
import { redisClient } from './redis';
import { AuthContext } from '../core/auth';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!idToken) { req.auth = undefined; return next(); }
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const cacheKey = `auth_bundle:${uid}`;
    let bundle: AuthContext | null = null;
    try { const cached = await redisClient.get(cacheKey); if (cached) bundle = JSON.parse(cached); } catch {}
    if (!bundle) {
      const user = await prisma.user.findUnique({ where: { firebaseUid: uid }, include: { userRoleLinks: { include: { role: true } } } });
      if (!user) { req.auth = undefined; return next(); }
      const roles = user.userRoleLinks.map(l => l.role.name);
      const permissions = new Set<string>();
      for (const r of roles) { /* simplified: mirror core/auth ROLE_CAPABILITIES logic */ }
      // Minimal bundle for BE-020
      bundle = { user: { id: user.id, firebaseUid: user.firebaseUid, name: user.name || undefined }, roles, permissions: new Set(), geoScopes: [] };
      await redisClient.setex(cacheKey, 300, JSON.stringify({ ...bundle, permissions: Array.from(bundle.permissions) }));
    }
    req.auth = bundle;
    next();
  } catch (e) { next(e); }
}
