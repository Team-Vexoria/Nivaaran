import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    const items = await prisma.milestone.findMany({
      where: projectId ? { project_id: projectId } : undefined,
      take: 50,
      orderBy: { created_at: 'desc' },
    });
    res.json({ ok: true, data: items });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const m = await prisma.milestone.create({
      data: {
        project_id: req.body.project_id,
        title: req.body.title || 'Prototype Deliverable',
        deliverable: req.body.deliverable_url || req.body.deliverable,
        due_at: req.body.due_at ? new Date(req.body.due_at) : new Date(),
        status: 'IN_PROGRESS',
        progress: req.body.progress || 50,
      },
    });
    res.json({ ok: true, data: m });
  } catch (e) {
    next(e);
  }
}
