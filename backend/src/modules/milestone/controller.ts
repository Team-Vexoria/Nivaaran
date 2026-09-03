import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.milestone.findMany({ where: { project_id: req.params.id }, take: 50 }) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { const m = await prisma.milestone.create({ data: { project_id: req.params.id, title: req.body.title, status: req.body.status || 'NOT_STARTED', target_date: req.body.target_date ? new Date(req.body.target_date) : null } }); res.json({ ok: true, data: m }); } catch (e) { next(e); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { const m = await prisma.milestone.update({ where: { id: req.params.milestoneId }, data: { title: req.body.title, status: req.body.status, target_date: req.body.target_date ? new Date(req.body.target_date) : undefined } }); res.json({ ok: true, data: m }); } catch (e) { next(e); }
}
