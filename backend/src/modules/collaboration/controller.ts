import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
import { OfferStatus } from '@prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    res.json({
      ok: true,
      data: await prisma.collaboration.findMany({
        where: projectId ? { project_id: projectId } : undefined,
        include: { offering_org: true, offers: true },
        take: 50,
      }),
    });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await prisma.collaboration.create({
      data: {
        project_id: req.body.project_id,
        offering_org_id: req.body.offering_org_id || req.body.org_id,
        need: req.body.need || 'Technical collaboration',
        form: req.body.form || 'expertise',
        status: OfferStatus.OPEN,
      },
    });
    res.json({ ok: true, data: c });
  } catch (e) {
    next(e);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await prisma.collaboration.update({
      where: { id: req.params.id },
      data: { status: OfferStatus.ACCEPTED, accepted_at: new Date() },
    });
    res.json({ ok: true, data: c });
  } catch (e) {
    next(e);
  }
}
