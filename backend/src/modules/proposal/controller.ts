import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await prisma.proposal.findMany({ take: 50 }) }); } catch (e) { next(e); }
}
export async function submit(req: Request, res: Response, next: NextFunction) {
  try { const p = await prisma.proposal.create({ data: { team_id: req.body.team_id, title: req.body.title, description: req.body.description, document_url: req.body.document_url, status: 'SUBMITTED' } }); res.json({ ok: true, data: p }); } catch (e) { next(e); }
}
export async function approve(req: Request, res: Response, next: NextFunction) {
  try { const p = await prisma.proposal.update({ where: { id: req.params.id }, data: { status: 'APPROVED', reviewed_by: req.auth?.user?.id || 'system', reviewed_at: new Date() } }); res.json({ ok: true, data: p }); } catch (e) { next(e); }
}
export async function requestRevision(req: Request, res: Response, next: NextFunction) {
  try { const p = await prisma.proposal.update({ where: { id: req.params.id }, data: { status: 'REVISION_REQUESTED', revision_notes: req.body.notes } }); res.json({ ok: true, data: p }); } catch (e) { next(e); }
}
