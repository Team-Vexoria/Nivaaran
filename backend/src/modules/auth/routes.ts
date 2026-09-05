import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { admin } from '../../config/firebase';
import { prisma } from '../../core/prisma';
const r = Router();

r.post('/auth/sync', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.body.idToken;
    if (!idToken) return res.status(401).json({ ok: false, error: { code: 'AUTHENTICATION_FAILED', message: 'Missing token' } });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email || req.body.email || 'demo@nivaaran.gov.in';
    const name = decoded.name || req.body.name || email.split('@')[0];

    const user = await prisma.user.upsert({
      where: { firebase_uid: uid },
      update: { email, name, updated_at: new Date() },
      create: { firebase_uid: uid, email, name, role: 'CITIZEN', created_at: new Date(), updated_at: new Date() },
    });
    // Link roles / geo scopes if provided
    await prisma.userRoleLink.createMany({ data: [{ user_id: user.id, role_id: 'CITIZEN', granted_by: 'sync' }], skipDuplicates: true }).catch(()=>{});
    res.json({ ok: true, data: { user, token: idToken } });
  } catch (e) { next(e); }
});

r.get('/auth/me', authMiddleware, async (req, res) => res.json(req.auth || {}));
r.patch('/auth/me', authMiddleware, async (req, res) => res.json({ ok: true }));
export default r;