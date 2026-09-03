import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.collaboration.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { const c = await prisma.collaboration.create({ data: { challenge_id: req.body.challenge_id, university_id: req.body.university_id, team_id: req.body.team_id, status: 'REQUESTED' } }); res.json({ ok: true, data: c }); } catch (e) { next(e); }
}
export async function accept(req: Request, res: Response, next: NextFunction) {
  try { const c = await prisma.collaboration.update({ where: { id: req.params.id }, data: { status: 'ACCEPTED', accepted_at: new Date() } }); res.json({ ok: true, data: c }); } catch (e) { next(e); }
}
