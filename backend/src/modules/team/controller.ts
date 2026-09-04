import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    res.json({
      ok: true,
      data: await prisma.team.findMany({
        where: projectId ? { project_id: projectId } : undefined,
        include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
        take: 50,
      }),
    });
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const t = await prisma.team.create({
      data: {
        project_id: req.body.project_id,
        name: req.body.name || 'Student Innovation Team',
        members: {
          create: {
            user_id: req.auth?.user?.id || req.body.lead_id || 'system',
            role: 'lead',
            is_mentor: true,
            skills: req.body.skills || ['lead'],
          },
        },
      },
      include: { members: true },
    });
    res.json({ ok: true, data: t });
  } catch (e) {
    next(e);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const m = await prisma.teamMember.create({
      data: {
        team_id: req.params.id,
        user_id: req.body.user_id,
        role: req.body.role || 'member',
        skills: req.body.skills || [],
        is_mentor: Boolean(req.body.is_mentor),
      },
    });
    res.json({ ok: true, data: m });
  } catch (e) {
    next(e);
  }
}
