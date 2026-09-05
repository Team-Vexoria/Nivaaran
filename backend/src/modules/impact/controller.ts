import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    const records = await prisma.impactRecord.findMany({
      where: projectId ? { project_id: projectId } : undefined,
      take: 50,
      orderBy: { created_at: 'desc' },
    });
    res.json({ ok: true, data: records });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await prisma.impactRecord.create({
      data: {
        project_id: req.body.project_id,
        metric_name: req.body.metric_name || req.body.metric_type || 'Beneficiaries Impacted',
        metric_group: req.body.metric_group || 'outcome',
        after_value: req.body.value || req.body.after_value,
        units: req.body.units,
        beneficiaries: req.body.beneficiaries,
        evidence_ref: req.body.evidence_ref,
        recorded_by: req.auth?.user?.id || 'system',
      },
    });
    res.json({ ok: true, data: record });
  } catch (e) {
    next(e);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await prisma.impactRecord.update({
      where: { id: req.params.id },
      data: {
        is_verified: true,
        verified_at: new Date(),
      },
    });
    res.json({ ok: true, data: record });
  } catch (e) {
    next(e);
  }
}
