import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    res.json({
      ok: true,
      data: await prisma.pilot.findMany({
        where: projectId ? { project_id: projectId } : undefined,
        take: 50,
      }),
    });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await prisma.pilot.create({
      data: {
        project_id: req.body.project_id,
        location: req.body.location || 'Pilot Site 1',
        district_code: req.body.district_code || 'RANCHI',
        scope: req.body.scope || '1 Panchayat Block',
        metrics: req.body.metrics || { status: req.body.outcome || 'IN_PROGRESS' },
        is_success: req.body.is_success !== undefined ? req.body.is_success : null,
        started_at: new Date(),
      },
    });
    res.json({ ok: true, data: p });
  } catch (e) {
    next(e);
  }
}

export async function complete(req: Request, res: Response, next: NextFunction) {
  try {
    const isSuccess = req.body.is_success !== undefined ? req.body.is_success : (req.body.outcome === 'SUCCESS');
    const p = await prisma.pilot.update({
      where: { id: req.params.id },
      data: {
        ended_at: new Date(),
        is_success: isSuccess,
        metrics: req.body.metrics || { outcome: req.body.outcome || (isSuccess ? 'SUCCESS' : 'NEEDS_IMPROVEMENT') },
      },
    });
    res.json({ ok: true, data: p });
  } catch (e) {
    next(e);
  }
}
