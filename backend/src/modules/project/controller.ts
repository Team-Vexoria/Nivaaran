import { Request, Response, NextFunction } from 'express';
import { projectService } from './service.js';
export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await projectService.list() }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await projectService.create(req.body) }); } catch (e) { next(e); }
}
// Auto-create on proposal approve + projections
