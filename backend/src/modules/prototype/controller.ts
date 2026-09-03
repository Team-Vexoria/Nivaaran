import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.prototype.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { const p = await prisma.prototype.create({ data: { project_id: req.body.project_id, title: req.body.title, description: req.body.description, stage: 'PROTOTYPE', deliverable_url: req.body.deliverable_url } }); res.json({ ok: true, data: p }); } catch (e) { next(e); }
}
