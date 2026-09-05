import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    res.json({
      ok: true,
      data: await prisma.deployment.findMany({
        where: projectId ? { project_id: projectId } : undefined,
        take: 50,
      }),
    });
  } catch (e) {
    next(e);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const d = await prisma.deployment.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        approved_by: req.auth?.user?.id || 'system',
        approval_ref: req.body.approval_ref || 'GOV-DEPLOY-AUTH',
      },
    });
    res.json({ ok: true, data: d });
  } catch (e) {
    next(e);
  }
}
