import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const unis = await prisma.university.findMany({ take: 50 });
    res.json({ ok: true, data: unis });
  } catch (e) { next(e); }
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.university.findUnique({ where: { id: req.params.id } }) }); } catch (e) { next(e); }
}
export async function listAcceptances(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await prisma.universityAcceptance.findMany({ where: { challenge_id: req.params.id }, take: 20 });
    res.json({ ok: true, data: a });
  } catch (e) { next(e); }
}
export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await prisma.universityAcceptance.create({ data: { challenge_id: req.params.id, university_id: req.body.university_id, decision: 'ACCEPTED', reason: req.body.reason } });
    res.json({ ok: true, data: a });
  } catch (e) { next(e); }
}
export async function decline(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await prisma.universityAcceptance.create({ data: { challenge_id: req.params.id, university_id: req.body.university_id, decision: 'DECLINED', reason: req.body.reason } });
    res.json({ ok: true, data: a });
  } catch (e) { next(e); }
}
