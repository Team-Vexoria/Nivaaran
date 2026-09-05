import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
const r = Router();
r.post('/auth/sync', async (req, res) => res.json({ ok: true }));
r.get('/auth/me', authMiddleware, async (req, res) => res.json(req.auth || {}));
r.patch('/auth/me', authMiddleware, async (req, res) => res.json({ ok: true }));
export default r;
