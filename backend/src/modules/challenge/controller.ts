// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { challengeService } from './service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ ok: true, data: await challengeService.list() });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await challengeService.create({
      ...req.body,
      submitter_id: req.auth?.user?.id || 'demo-citizen',
    });
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function transition(req: Request, res: Response, next: NextFunction) {
  try {
    const ifMatch = req.headers['if-match']
      ? parseInt(req.headers['if-match'] as string, 10)
      : undefined;

    const schema = z.object({ action: z.string().min(1), payload: z.record(z.string(), z.any()).optional(), ifMatch: z.number().optional() });
    const parsed = schema.parse(req.body);
    // @ts-ignore
    // @ts-ignore
    const data = await challengeService.transition(req.params.id, parsed.action, req.auth, parsed.payload, ifMatch);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
}

export async function listTransitions(req: Request, res: Response, next: NextFunction) {
  try {
    const { getAllowedTransitions } = await import('../../workflow/registry.js');
    const challenge = await challengeService.getById(req.params.id);
    if (!challenge) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Challenge not found' },
      });
    }
    const transitions = getAllowedTransitions(challenge.status as any);
    res.json({ ok: true, data: transitions });
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const challenge = await challengeService.getById(req.params.id);
    if (!challenge) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: 'Challenge not found' },
      });
    }
    res.json({ ok: true, data: challenge });
  } catch (e) {
    next(e);
  }
}

export async function timeline(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ ok: true, data: await challengeService.timeline(req.params.id) });
  } catch (e) {
    next(e);
  }
}

export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ ok: true, data: await challengeService.mine(req.auth?.user?.id) });
  } catch (e) {
    next(e);
  }
}