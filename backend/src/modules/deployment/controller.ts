import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.deployment.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function approve(req: Request, res: Response, next: NextFunction) {
  try { const d = await prisma.deployment.update({ where: { id: req.params.id }, data: { approved: true, approved_by: req.auth?.user?.id || 'system', approved_at: new Date() } }); res.json({ ok: true, data: d }); } catch (e) { next(e); }
}
