import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.team.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { const t = await prisma.team.create({ data: { name: req.body.name, challenge_id: req.body.challenge_id, faculty_id: req.auth?.user?.id || 'system' } }); res.json({ ok: true, data: t }); } catch (e) { next(e); }
}
export async function addMember(req: Request, res: Response, next: NextFunction) {
  try { const m = await prisma.teamMember.create({ data: { team_id: req.params.id, user_id: req.body.user_id, role: req.body.role || 'MEMBER' } }); res.json({ ok: true, data: m }); } catch (e) { next(e); }
}
