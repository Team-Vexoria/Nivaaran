import { prisma } from '../../core/prisma.js';
export const universityService = {
  async list() { return []; },
  async getById(id: string) { return null; },
  async create(input: any) { return input; },
};
