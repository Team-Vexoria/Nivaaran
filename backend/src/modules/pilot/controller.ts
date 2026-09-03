import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.pilot.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { const p = await prisma.pilot.create({ data: { project_id: req.body.project_id, outcome: req.body.outcome || 'NEEDS_IMPROVEMENT', started_at: new Date() } }); res.json({ ok: true, data: p }); } catch (e) { next(e); }
}
export async function complete(req: Request, res: Response, next: NextFunction) {
  try { const p = await prisma.pilot.update({ where: { id: req.params.id }, data: { completed_at: new Date(), outcome: req.body.outcome || 'SUCCESS' } }); res.json({ ok: true, data: p }); } catch (e) { next(e); }
}
