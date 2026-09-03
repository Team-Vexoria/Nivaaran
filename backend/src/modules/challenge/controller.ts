import { Request, Response, NextFunction } from 'express';
import { challengeService } from './service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await challengeService.list() }); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await challengeService.create({ ...req.body, submitter_id: req.auth?.user?.id || 'demo-citizen' });
    res.status(201).json({ ok: true, data });
  } catch (e) { next(e); }
}

export async function transition(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await challengeService.transition(req.params.id, req.body.action, req.auth);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
}

export async function listTransitions(req: Request, res: Response, next: NextFunction) {
  try {
    const { TRANSITIONS } = await import('../../workflow/registry.js');
    res.json({ ok: true, data: TRANSITIONS.filter((t:any)=>t.from===req.params.id||t.action===req.query.action) });
  } catch (e) { next(e); }
}
export async function getById(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await challengeService.getById(req.params.id) }); } catch (e) { next(e); }
}
export async function timeline(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await challengeService.timeline(req.params.id) }); } catch (e) { next(e); }
}
export async function mine(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: await challengeService.mine(req.auth?.user?.id) }); } catch (e) { next(e); }
}
