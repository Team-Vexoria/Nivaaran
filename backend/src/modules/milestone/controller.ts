import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id || (req.query.projectId as string);
    res.json({
      ok: true,
      data: await prisma.milestone.findMany({
        where: projectId ? { project_id: projectId } : undefined,
        take: 50,
        orderBy: { due_at: 'asc' },
      }),
    });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const m = await prisma.milestone.create({
      data: {
        project_id: req.params.id || req.body.project_id,
        title: req.body.title,
        deliverable: req.body.deliverable,
        status: req.body.status || 'NOT_STARTED',
        due_at: req.body.due_at || req.body.target_date ? new Date(req.body.due_at || req.body.target_date) : new Date(),
        progress: req.body.progress || 0,
      },
    });
    res.json({ ok: true, data: m });
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const m = await prisma.milestone.update({
      where: { id: req.params.milestoneId || req.params.id },
      data: {
        title: req.body.title,
        status: req.body.status,
        deliverable: req.body.deliverable,
        due_at: req.body.due_at || req.body.target_date ? new Date(req.body.due_at || req.body.target_date) : undefined,
        progress: req.body.progress !== undefined ? req.body.progress : undefined,
      },
    });
    res.json({ ok: true, data: m });
  } catch (e) {
    next(e);
  }
}
