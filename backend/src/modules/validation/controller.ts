import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const q = await prisma.validation.findMany({ take: 50, orderBy: { decided_at: 'desc' }, include: { challenge: { select: { id: true, title: true, status: true } } } });
    res.json({ ok: true, data: q });
  } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const v = await prisma.validation.create({ data: { challenge_id: req.body.challenge_id, validator_id: req.auth?.user?.id || 'system', decision: req.body.decision, reason: req.body.reason, decided_at: new Date() } });
    res.json({ ok: true, data: v });
  } catch (e) { next(e); }
}
export async function clarify(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await prisma.challenge.update({ where: { id: req.params.id }, data: { status: 'CLARIFICATION_REQUESTED', updated_at: new Date() } });
    res.json({ ok: true, data: c });
  } catch (e) { next(e); }
}
