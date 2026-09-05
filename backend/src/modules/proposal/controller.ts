import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
import { ProposalStatus } from '@prisma/client';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.query.projectId as string | undefined;
    res.json({
      ok: true,
      data: await prisma.proposal.findMany({
        where: projectId ? { project_id: projectId } : undefined,
        take: 50,
      }),
    });
  } catch (e) {
    next(e);
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await prisma.proposal.create({
      data: {
        project_id: req.body.project_id,
        submitter_id: req.auth?.user?.id || req.body.submitter_id || 'system',
        title: req.body.title || 'Solution Proposal',
        content_md: req.body.description || req.body.content_md,
        doc_ref: req.body.document_url || req.body.doc_ref,
        status: ProposalStatus.SUBMITTED,
      },
    });
    res.json({ ok: true, data: p });
  } catch (e) {
    next(e);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await prisma.proposal.update({
      where: { id: req.params.id },
      data: {
        status: ProposalStatus.APPROVED,
        reviewer_id: req.auth?.user?.id || 'system',
        reviewed_at: new Date(),
      },
    });
    res.json({ ok: true, data: p });
  } catch (e) {
    next(e);
  }
}

export async function requestRevision(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await prisma.proposal.update({
      where: { id: req.params.id },
      data: {
        status: ProposalStatus.REVISION_REQUESTED,
        reviewer_id: req.auth?.user?.id || 'system',
        reviewed_at: new Date(),
        revision_request: req.body.notes ? { note: req.body.notes } : undefined,
        review_notes: req.body.notes ? { note: req.body.notes } : undefined,
      },
    });
    res.json({ ok: true, data: p });
  } catch (e) {
    next(e);
  }
}
