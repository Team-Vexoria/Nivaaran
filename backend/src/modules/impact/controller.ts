import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.impact.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { const i = await prisma.impact.create({ data: { challenge_id: req.body.challenge_id, metric_type: req.body.metric_type, value: req.body.value, evidence_ids: req.body.evidence_ids || [] } }); res.json({ ok: true, data: i }); } catch (e) { next(e); }
}
export async function verify(req: Request, res: Response, next: NextFunction) {
  try { const i = await prisma.impact.update({ where: { id: req.params.id }, data: { verified: true, verified_by: req.auth?.user?.id || 'system', verified_at: new Date() } }); res.json({ ok: true, data: i }); } catch (e) { next(e); }
}
