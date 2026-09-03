import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core/errors.js';
import { logger } from '../../core/logger.js';
import { identityService } from './service.js';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth?.user?.id || 'demo-citizen';
    const profile = await identityService.getProfile(userId);
    res.json({ ok: true, data: profile });
  } catch (e) { next(e); }
}

export async function listRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await identityService.listRoles();
    res.json({ ok: true, data: roles });
  } catch (e) { next(e); }
}
