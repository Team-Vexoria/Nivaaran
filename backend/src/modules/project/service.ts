import { prisma } from '../../core/prisma.js';

export const projectService = {
  async list() {
    return prisma.project.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        challenge: { select: { id: true, title: true, status: true, district_code: true } },
        university: { select: { id: true, name: true, code: true } },
      },
    });
  },
  async create(input: any) {
    return prisma.project.create({
      data: {
        challenge_id: input.challenge_id,
        university_id: input.university_id,
        proposal_title: input.title || input.proposal_title,
        proposal_abstract: input.abstract || input.proposal_abstract || input.description,
        proposal_doc_ref: input.doc_ref || input.proposal_doc_ref,
        status: input.status || 'PROPOSAL_REVIEW',
      },
    });
  },
};
