import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const projectService = {
  async list() { return prisma.project.findMany({ take: 20, orderBy: { created_at: 'desc' } as any }); },
};
export async function create(input: any) {
  return require('../../core/prisma.js').prisma.project.create({ data: { ...input, status: 'PROTOTYPE' } });
}
